package com.bioimpedance.controller;

import com.bioimpedance.dto.request.ClientRequestDTO;
import com.bioimpedance.dto.response.ClientResponseDTO;
import com.bioimpedance.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponseDTO create(@Valid @RequestBody ClientRequestDTO dto) {
        return clientService.create(dto);
    }

    @GetMapping
    public List<ClientResponseDTO> findAll() {
        return clientService.findAll();
    }

    @GetMapping("/{id}")
    public ClientResponseDTO findById(@PathVariable String id) {
        return clientService.findById(id);
    }

    @PutMapping("/{id}")
    public ClientResponseDTO update(@PathVariable String id, @Valid @RequestBody ClientRequestDTO dto) {
        return clientService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        clientService.delete(id);
    }
}