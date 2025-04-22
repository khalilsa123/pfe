package com.example.loginpfe.exceptions;

public class OperateurNotFoundException extends RuntimeException {
    public OperateurNotFoundException(Long id) {
        super("Operateur not found with id: " + id);
    }
}
