package com.bioimpedance.repository;

import com.bioimpedance.entity.BillingSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface BillingSubscriptionRepository extends JpaRepository<BillingSubscription, String> {

    Optional<BillingSubscription> findFirstByStripeSubscriptionIdOrderByUpdatedAtDesc(String subscriptionId);

    Optional<BillingSubscription> findFirstByStripeCustomerIdOrderByUpdatedAtDesc(String customerId);

    Optional<BillingSubscription> findFirstByStatusInOrderByUpdatedAtDesc(Collection<String> statuses);

    Optional<BillingSubscription> findFirstByOrderByUpdatedAtDesc();
}
