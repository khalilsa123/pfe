/**package com.example.loginpfe.Service;

 import org.springframework.stereotype.Component;

 import java.security.SecureRandom;
 import java.util.Base64;
 @Component
 public class PasswordGenerator {

 private static final SecureRandom random = new SecureRandom();
 private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

 public static String generateRandomPassword(int length) {
 StringBuilder password = new StringBuilder(length);
 for (int i = 0; i < length; i++) {
 password.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
 }
 return password.toString();
 }
 }*/