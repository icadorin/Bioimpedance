package com.bioimpedance.service;

import com.bioimpedance.dto.request.ClientRequestDTO;
import com.bioimpedance.dto.response.ClientResponseDTO;
import com.bioimpedance.entity.Client;
import com.bioimpedance.exception.ResourceNotFoundException;
import com.bioimpedance.mapper.ClientMapper;
import com.bioimpedance.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Transactional
    public ClientResponseDTO create(ClientRequestDTO dto) {
        if (clientRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        Client client = clientMapper.toEntity(dto);
        client = clientRepository.save(client);
        return clientMapper.toResponse(client);
    }

    public List<ClientResponseDTO> findAll() {
        return clientRepository.findAll().stream()
            .map(clientMapper::toResponse)
            .toList();
    }

    public ClientResponseDTO findById(String id) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
        return clientMapper.toResponse(client);
    }

    @Transactional
    public ClientResponseDTO update(String id, ClientRequestDTO dto) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));

        clientMapper.updateEntity(client, dto);
        client = clientRepository.save(client);
        return clientMapper.toResponse(client);
    }

    @Transactional
    public void delete(String id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente não encontrado");
        }
        clientRepository.deleteById(id);
    }
}