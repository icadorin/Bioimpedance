package com.bioimpedance.service;

import com.bioimpedance.config.StripeProperties;
import com.bioimpedance.constants.Plan;
import com.bioimpedance.constants.PlanFeature;
import com.bioimpedance.dto.request.CheckoutRequestDTO;
import com.bioimpedance.dto.response.*;
import com.bioimpedance.entity.BillingSubscription;
import com.bioimpedance.repository.BillingSubscriptionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BillingService {

    private static final String STATUS_FREE = "free";
    private static final String STATUS_ACTIVE = "active";
    private static final List<String> GRANT_ACCESS_STATUSES = List.of("active", "trialing", "past_due");

    private final BillingSubscriptionRepository billingSubscriptionRepository;
    private final StripeProperties stripeProperties;
    private final ObjectMapper objectMapper;

    @Value("${billing.default-plan:BASIC}")
    private String defaultPlanValue;

    public List<BillingPlanDTO> getPlans() {
        return Arrays.stream(Plan.values())
            .sorted((left, right) -> Integer.compare(left.getSortOrder(), right.getSortOrder()))
            .map(this::toPlanDTO)
            .toList();
    }

    public SubscriptionResponseDTO getCurrentSubscription() {
        Optional<BillingSubscription> subscription = findCurrentPaidSubscription();
        Plan plan = subscription.map(BillingSubscription::getPlan).orElse(defaultPlan());

        return SubscriptionResponseDTO.builder()
            .plan(plan.getSlug())
            .planName(plan.getLabel())
            .status(subscription.map(BillingSubscription::getStatus).orElse(STATUS_FREE))
            .currentPeriodEnd(subscription.map(BillingSubscription::getCurrentPeriodEnd).orElse(null))
            .cancelAtPeriodEnd(subscription.map(BillingSubscription::isCancelAtPeriodEnd).orElse(false))
            .billingPortalReady(hasText(latestCustomerId()) && stripeConfigured())
            .features(toFeatureDTOs(plan))
            .build();
    }

    public boolean hasFeature(PlanFeature feature) {
        Plan plan = findCurrentPaidSubscription()
            .map(BillingSubscription::getPlan)
            .orElse(defaultPlan());

        return plan.includes(feature);
    }

    public void requireFeature(PlanFeature feature) {
        if (!hasFeature(feature)) {
            throw new IllegalArgumentException("Recurso indisponivel no plano atual");
        }
    }

    public CheckoutResponseDTO createCheckoutSession(CheckoutRequestDTO dto) throws StripeException {
        Plan plan = dto.getPlan();

        if (plan == Plan.BASIC) {
            throw new IllegalArgumentException("O plano Basic nao precisa de checkout");
        }

        ensureStripeConfigured();
        String priceId = stripeProperties.priceIdFor(plan);

        if (!hasText(priceId)) {
            throw new IllegalArgumentException("Price ID do plano " + plan.getLabel() + " nao configurado");
        }

        Stripe.apiKey = stripeProperties.getSecretKey();

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
            .setSuccessUrl(stripeProperties.getSuccessUrl())
            .setCancelUrl(stripeProperties.getCancelUrl())
            .setClientReferenceId("current-account")
            .putMetadata("plan", plan.getSlug())
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setPrice(priceId)
                    .setQuantity(1L)
                    .build()
            );

        String customerId = latestCustomerId();
        if (hasText(customerId)) {
            paramsBuilder.setCustomer(customerId);
        } else if (hasText(dto.getEmail())) {
            paramsBuilder.setCustomerEmail(dto.getEmail());
        }

        Session session = Session.create(paramsBuilder.build());
        return CheckoutResponseDTO.builder().url(session.getUrl()).build();
    }

    public CustomerPortalResponseDTO createCustomerPortalSession() throws StripeException {
        ensureStripeConfigured();

        String customerId = latestCustomerId();
        if (!hasText(customerId)) {
            throw new IllegalArgumentException("Nenhum cliente Stripe encontrado para a assinatura atual");
        }

        Stripe.apiKey = stripeProperties.getSecretKey();

        com.stripe.param.billingportal.SessionCreateParams params =
            com.stripe.param.billingportal.SessionCreateParams.builder()
                .setCustomer(customerId)
                .setReturnUrl(stripeProperties.getPortalReturnUrl())
                .build();

        com.stripe.model.billingportal.Session session =
            com.stripe.model.billingportal.Session.create(params);

        return CustomerPortalResponseDTO.builder().url(session.getUrl()).build();
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!hasText(stripeProperties.getWebhookSecret())) {
            throw new IllegalArgumentException("Webhook secret do Stripe nao configurado");
        }

        if (!hasText(signature)) {
            throw new IllegalArgumentException("Assinatura Stripe ausente");
        }

        try {
            Webhook.constructEvent(payload, signature, stripeProperties.getWebhookSecret());
            JsonNode event = objectMapper.readTree(payload);
            String type = event.path("type").asText();
            JsonNode object = event.path("data").path("object");

            switch (type) {
                case "checkout.session.completed" -> handleCheckoutCompleted(object);
                case "customer.subscription.created", "customer.subscription.updated" ->
                    handleSubscriptionChanged(object, false);
                case "customer.subscription.deleted" -> handleSubscriptionChanged(object, true);
                default -> {
                }
            }
        } catch (SignatureVerificationException | JsonProcessingException ex) {
            throw new IllegalArgumentException("Webhook Stripe invalido");
        }
    }

    private void handleCheckoutCompleted(JsonNode object) {
        String subscriptionId = text(object, "subscription");
        String customerId = text(object, "customer");
        String planSlug = text(object.path("metadata"), "plan");
        Plan plan = Plan.fromSlug(planSlug).orElse(defaultPlan());

        BillingSubscription subscription = findBySubscriptionOrCustomer(subscriptionId, customerId)
            .orElseGet(BillingSubscription::new);

        subscription.setPlan(plan);
        subscription.setStatus(STATUS_ACTIVE);
        subscription.setStripeCustomerId(customerId);
        subscription.setStripeSubscriptionId(subscriptionId);
        subscription.setStripeCheckoutSessionId(text(object, "id"));
        subscription.setStripePriceId(stripeProperties.priceIdFor(plan));
        subscription.setCustomerEmail(customerEmailFromCheckout(object));
        subscription.setCancelAtPeriodEnd(false);

        billingSubscriptionRepository.save(subscription);
    }

    private void handleSubscriptionChanged(JsonNode object, boolean deleted) {
        String subscriptionId = text(object, "id");
        String customerId = text(object, "customer");
        String status = deleted ? "canceled" : text(object, "status");
        JsonNode firstItem = firstSubscriptionItem(object);
        String priceId = text(firstItem.path("price"), "id");

        Optional<BillingSubscription> existing = findBySubscriptionOrCustomer(subscriptionId, customerId);
        Plan plan = planByPriceId(priceId)
            .or(() -> existing.map(BillingSubscription::getPlan))
            .orElse(defaultPlan());

        BillingSubscription subscription = existing.orElseGet(BillingSubscription::new);
        subscription.setPlan(plan);
        subscription.setStatus(hasText(status) ? status : STATUS_ACTIVE);
        subscription.setStripeCustomerId(customerId);
        subscription.setStripeSubscriptionId(subscriptionId);
        subscription.setStripePriceId(priceId);
        subscription.setCurrentPeriodEnd(currentPeriodEnd(object, firstItem));
        subscription.setCancelAtPeriodEnd(object.path("cancel_at_period_end").asBoolean(false));

        billingSubscriptionRepository.save(subscription);
    }

    private BillingPlanDTO toPlanDTO(Plan plan) {
        boolean paid = plan != Plan.BASIC;

        return BillingPlanDTO.builder()
            .plan(plan.getSlug())
            .name(plan.getLabel())
            .sortOrder(plan.getSortOrder())
            .paid(paid)
            .checkoutReady(!paid || hasText(stripeProperties.priceIdFor(plan)))
            .features(toFeatureDTOs(plan))
            .build();
    }

    private List<PlanFeatureDTO> toFeatureDTOs(Plan plan) {
        return Arrays.stream(PlanFeature.values())
            .map(feature -> PlanFeatureDTO.builder()
                .key(feature.getKey())
                .label(feature.getLabel())
                .included(plan.includes(feature))
                .build())
            .toList();
    }

    private Optional<BillingSubscription> findCurrentPaidSubscription() {
        return billingSubscriptionRepository.findFirstByStatusInOrderByUpdatedAtDesc(GRANT_ACCESS_STATUSES);
    }

    private Optional<BillingSubscription> findBySubscriptionOrCustomer(String subscriptionId, String customerId) {
        if (hasText(subscriptionId)) {
            Optional<BillingSubscription> subscription =
                billingSubscriptionRepository.findFirstByStripeSubscriptionIdOrderByUpdatedAtDesc(subscriptionId);

            if (subscription.isPresent()) {
                return subscription;
            }
        }

        if (hasText(customerId)) {
            return billingSubscriptionRepository.findFirstByStripeCustomerIdOrderByUpdatedAtDesc(customerId);
        }

        return Optional.empty();
    }

    private Optional<Plan> planByPriceId(String priceId) {
        if (!hasText(priceId)) {
            return Optional.empty();
        }

        return Arrays.stream(Plan.values())
            .filter(plan -> priceId.equals(stripeProperties.priceIdFor(plan)))
            .findFirst();
    }

    private String latestCustomerId() {
        return billingSubscriptionRepository.findFirstByOrderByUpdatedAtDesc()
            .map(BillingSubscription::getStripeCustomerId)
            .orElse(null);
    }

    private JsonNode firstSubscriptionItem(JsonNode object) {
        JsonNode data = object.path("items").path("data");
        return data.isArray() && data.size() > 0 ? data.get(0) : objectMapper.createObjectNode();
    }

    private LocalDateTime currentPeriodEnd(JsonNode object, JsonNode firstItem) {
        long currentPeriodEnd = object.path("current_period_end").asLong(0);

        if (currentPeriodEnd <= 0) {
            currentPeriodEnd = firstItem.path("current_period_end").asLong(0);
        }

        if (currentPeriodEnd <= 0) {
            return null;
        }

        return LocalDateTime.ofInstant(Instant.ofEpochSecond(currentPeriodEnd), ZoneOffset.UTC);
    }

    private String customerEmailFromCheckout(JsonNode object) {
        String email = text(object.path("customer_details"), "email");
        return hasText(email) ? email : text(object, "customer_email");
    }

    private Plan defaultPlan() {
        return Plan.fromSlug(defaultPlanValue)
            .or(() -> {
                try {
                    return Optional.of(Plan.valueOf(defaultPlanValue.toUpperCase()));
                } catch (IllegalArgumentException ex) {
                    return Optional.empty();
                }
            })
            .orElse(Plan.BASIC);
    }

    private void ensureStripeConfigured() {
        if (!stripeConfigured()) {
            throw new IllegalArgumentException("STRIPE_SECRET_KEY nao configurada");
        }
    }

    private boolean stripeConfigured() {
        return hasText(stripeProperties.getSecretKey());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (value.isMissingNode() || value.isNull()) {
            return null;
        }

        String text = value.asText();
        return hasText(text) ? text : null;
    }
}
