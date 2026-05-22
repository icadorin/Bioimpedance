package com.bioimpedance.entity;

import com.bioimpedance.constants.Plan;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "billing_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Plan plan;

    @Column(nullable = false)
    private String status;

    private String stripeCustomerId;
    private String stripeSubscriptionId;
    private String stripeCheckoutSessionId;
    private String stripePriceId;
    private String customerEmail;
    private LocalDateTime currentPeriodEnd;
    private boolean cancelAtPeriodEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
