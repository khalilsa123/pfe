package com.example.loginpfe.Repository;

import com.example.loginpfe.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, Long> {
    // no custom methods needed for basic read
    Stock findByReference(String reference);
}