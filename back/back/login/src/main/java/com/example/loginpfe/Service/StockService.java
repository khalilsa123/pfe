package com.example.loginpfe.Service;

import com.example.loginpfe.entity.Stock;
import com.example.loginpfe.Repository.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class StockService {
    private final StockRepository repo;

    public StockService(StockRepository repo) {
        this.repo = repo;
    }

    public List<Stock> getAll() {
        return repo.findAll();
    }

    public Stock getByReference(String reference) {
        return repo.findByReference(reference);
    }
}
