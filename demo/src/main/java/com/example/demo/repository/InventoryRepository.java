package com.example.demo.repository;

import com.example.demo.model.InventoryModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<InventoryModel,Long> {

}
