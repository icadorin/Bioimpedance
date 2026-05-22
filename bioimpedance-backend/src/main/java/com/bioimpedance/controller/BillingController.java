package com.bioimpedance.controller;

import com.bioimpedance.dto.request.CheckoutRequestDTO;
import com.bioimpedance.dto.response.BillingPlanDTO;
import com.bioimpedance.dto.response.CheckoutResponseDTO;
import com.bioimpedance.dto.response.CustomerPortalResponseDTO;
import com.bioimpedance.dto.response.SubscriptionResponseDTO;
import com.bioimpedance.service.BillingService;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/plans")
    public List<BillingPlanDTO> getPlans() {
        return billingService.getPlans();
    }

    @GetMapping("/subscription")
    public SubscriptionResponseDTO getCurrentSubscription() {
        return billingService.getCurrentSubscription();
    }

    @PostMapping("/checkout")
    public CheckoutResponseDTO createCheckoutSession(@Valid @RequestBody CheckoutRequestDTO dto)
        throws StripeException {
        return billingService.createCheckoutSession(dto);
    }

    @PostMapping("/portal")
    public CustomerPortalResponseDTO createCustomerPortalSession() throws StripeException {
        return billingService.createCustomerPortalSession();
    }

    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> handleWebhook(
        @RequestBody String payload,
        @RequestHeader(name = "Stripe-Signature", required = false) String signature
    ) {
        try {
            billingService.handleWebhook(payload, signature);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
