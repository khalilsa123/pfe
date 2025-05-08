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
     * GET /api/stocks → list all stock entries
     */
    @GetMapping
    public List<Stock> listAll() {
        return service.getAll();
    }

    /**
     * GET /api/stocks/{ref} → retrieve one by reference
     */
    @GetMapping("/{reference}")
    public Stock getByReference(@PathVariable String reference) {
        return service.getByReference(reference);
    }
}