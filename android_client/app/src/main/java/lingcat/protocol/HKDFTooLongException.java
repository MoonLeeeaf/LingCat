package lingcat.protocol;

public class HKDFTooLongException extends Exception {
    public HKDFTooLongException(String message) {
        super(message);
    }
}
