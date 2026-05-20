package uz.boshliq.equipment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EquipmentApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(EquipmentApiApplication.class, args);
	}

}
