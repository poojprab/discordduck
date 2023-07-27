/*
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class javabackendclient {
    public static void main(String[] args) {
        System.out.println("hi");
        String jsonData = "{\"name\":\"John Doe\", \"age\":30, \"occupation\":\"Developer\"}";

        try {
            // Replace 'http://localhost:3000/receiveData' with the actual server URL and route
            URL url = new URL("http://localhost:3000/json.data");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            System.out.println("hi");

            // Set request method to POST
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);

            // Write the JSON data to the server
            try (OutputStream outputStream = connection.getOutputStream()) {
                byte[] input = jsonData.getBytes(StandardCharsets.UTF_8);
                outputStream.write(input, 0, input.length);
            }

            // Read the response from the server (optional)
            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            // Close the connection
            connection.disconnect();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
*/
