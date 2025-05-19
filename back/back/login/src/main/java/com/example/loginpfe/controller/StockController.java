// src/main/java/com/example/loginpfe/controller/StockController.java
package com.example.loginpfe.controller;

import com.example.loginpfe.Service.StockService;
import com.example.loginpfe.entity.Stock;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/stocks")
public class StockController {
    private final StockService service;

    public StockController(StockService service) {
        this.service = service;
    }

    /**
     * GET /api/stocks → liste tous les stocks
     */
    @GetMapping
    public List<Stock> listAll() {
        return service.getAll();
    }

    /**
     * GET /api/stocks/{reference} → récupère un stock par référence
     */
    @GetMapping("/{reference}")
    public Stock getByReference(@PathVariable String reference) {
        return service.getByReference(reference);
    }
}
