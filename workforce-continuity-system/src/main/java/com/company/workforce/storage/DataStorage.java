package com.company.workforce.storage;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class DataStorage {

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String DATA_FOLDER = "data";

    private static final String EMPLOYEES_FILE =
            DATA_FOLDER + "/employees.json";

    private static final String LEAVES_FILE =
            DATA_FOLDER + "/leaves.json";

    private static final String REPLACEMENTS_FILE =
            DATA_FOLDER + "/replacements.json";


    // =========================================================
    // CREATE DATA FOLDER
    // =========================================================

    private static void createDataFolder() {

        File folder = new File(DATA_FOLDER);

        if (!folder.exists()) {
            folder.mkdirs();
        }
    }


    // =========================================================
    // EMPLOYEES
    // =========================================================

    public static <T> List<T> loadEmployees(Class<T> type) {

        createDataFolder();

        File file = new File(EMPLOYEES_FILE);

        if (!file.exists()) {
            return new ArrayList<>();
        }

        try {

            return mapper.readValue(
                    file,
                    mapper.getTypeFactory()
                            .constructCollectionType(
                                    List.class,
                                    type
                            )
            );

        } catch (IOException e) {

            System.out.println(
                    "Error reading employees.json: "
                            + e.getMessage()
            );

            return new ArrayList<>();
        }
    }


    public static void saveEmployees(List<?> employees) {

        createDataFolder();

        try {

            mapper.writerWithDefaultPrettyPrinter()
                    .writeValue(
                            new File(EMPLOYEES_FILE),
                            employees
                    );

        } catch (IOException e) {

            System.out.println(
                    "Error saving employees.json: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // LEAVES
    // =========================================================

    public static <T> List<T> loadLeaves(Class<T> type) {

        createDataFolder();

        File file = new File(LEAVES_FILE);

        if (!file.exists()) {
            return new ArrayList<>();
        }

        try {

            return mapper.readValue(
                    file,
                    mapper.getTypeFactory()
                            .constructCollectionType(
                                    List.class,
                                    type
                            )
            );

        } catch (IOException e) {

            System.out.println(
                    "Error reading leaves.json: "
                            + e.getMessage()
            );

            return new ArrayList<>();
        }
    }


    public static void saveLeaves(List<?> leaves) {

        createDataFolder();

        try {

            mapper.writerWithDefaultPrettyPrinter()
                    .writeValue(
                            new File(LEAVES_FILE),
                            leaves
                    );

        } catch (IOException e) {

            System.out.println(
                    "Error saving leaves.json: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // REPLACEMENTS
    // =========================================================

    public static <T> List<T> loadReplacements(Class<T> type) {

        createDataFolder();

        File file = new File(REPLACEMENTS_FILE);

        if (!file.exists()) {
            return new ArrayList<>();
        }

        try {

            return mapper.readValue(
                    file,
                    mapper.getTypeFactory()
                            .constructCollectionType(
                                    List.class,
                                    type
                            )
            );

        } catch (IOException e) {

            System.out.println(
                    "Error reading replacements.json: "
                            + e.getMessage()
            );

            return new ArrayList<>();
        }
    }


    public static void saveReplacements(List<?> replacements) {

        createDataFolder();

        try {

            mapper.writerWithDefaultPrettyPrinter()
                    .writeValue(
                            new File(REPLACEMENTS_FILE),
                            replacements
                    );

        } catch (IOException e) {

            System.out.println(
                    "Error saving replacements.json: "
                            + e.getMessage()
            );
        }
    }
}