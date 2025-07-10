package com.example.demo.exception;

public class InventoryNotFoundException extends RuntimeException{
    public InventoryNotFoundException(Long id){
        super("Could not find id" + id);
    }

    public InventoryNotFoundException(String massage){
        super(massage);
    }
}
