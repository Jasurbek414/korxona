import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin123 hash: " + encoder.encode("admin123"));
        System.out.println("admin hash: " + encoder.encode("admin"));
        System.out.println("Matches admin123 with DB hash? " + encoder.matches("admin123", "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"));
        System.out.println("Matches admin with DB hash? " + encoder.matches("admin", "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"));
    }
}
