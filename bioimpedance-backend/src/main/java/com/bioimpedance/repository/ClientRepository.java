package com.bioimpedance.repository;

import com.bioimpedance.entity.Client;
import com.bioimpedance.constants.ClientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, String> {

    List<Client> findByStatus(ClientStatus status);

    long countByStatus(ClientStatus status);

    boolean existsByEmail(String email);
}