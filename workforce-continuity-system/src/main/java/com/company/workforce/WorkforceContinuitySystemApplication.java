package com.company.workforce;

import com.company.workforce.storage.DataStorage;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@SpringBootApplication
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
		"http://localhost:5173",
		"http://localhost:5174"
})
public class WorkforceContinuitySystemApplication {

	// =========================================================
	// ID GENERATORS
	// =========================================================

	private final AtomicLong employeeId = new AtomicLong(0);
	private final AtomicLong leaveId = new AtomicLong(0);
	private final AtomicLong replacementId = new AtomicLong(0);

	// =========================================================
	// DATA
	// =========================================================

	private final List<Employee> employees =
			Collections.synchronizedList(new ArrayList<>());

	private final List<LeaveRequest> leaves =
			Collections.synchronizedList(new ArrayList<>());

	private final List<Replacement> replacements =
			Collections.synchronizedList(new ArrayList<>());


	// =========================================================
	// STARTUP
	// =========================================================

	public WorkforceContinuitySystemApplication() {

		loadData();

		/*
		 * If JSON files are empty on first run,
		 * create the original sample data.
		 */
		if (employees.isEmpty() && leaves.isEmpty()) {
			createDefaultData();
			saveAllData();
		}

		updateIdCounters();
	}


	// =========================================================
	// LOAD DATA FROM JSON
	// =========================================================

	private void loadData() {

		employees.clear();
		leaves.clear();
		replacements.clear();

		employees.addAll(
				DataStorage.loadEmployees(Employee.class)
		);

		leaves.addAll(
				DataStorage.loadLeaves(LeaveRequest.class)
		);

		replacements.addAll(
				DataStorage.loadReplacements(Replacement.class)
		);
	}


	// =========================================================
	// SAVE ALL DATA
	// =========================================================

	private void saveAllData() {

		DataStorage.saveEmployees(employees);
		DataStorage.saveLeaves(leaves);
		DataStorage.saveReplacements(replacements);
	}


	// =========================================================
	// UPDATE ID COUNTERS
	// =========================================================

	private void updateIdCounters() {

		long maxEmployeeId = employees.stream()
				.filter(Objects::nonNull)
				.mapToLong(e ->
						e.id == null ? 0 : e.id
				)
				.max()
				.orElse(0);

		long maxLeaveId = leaves.stream()
				.filter(Objects::nonNull)
				.mapToLong(l ->
						l.id == null ? 0 : l.id
				)
				.max()
				.orElse(0);

		long maxReplacementId = replacements.stream()
				.filter(Objects::nonNull)
				.mapToLong(r ->
						r.id == null ? 0 : r.id
				)
				.max()
				.orElse(0);

		employeeId.set(maxEmployeeId);
		leaveId.set(maxLeaveId);
		replacementId.set(maxReplacementId);
	}


	// =========================================================
	// DEFAULT DATA
	// =========================================================

	private void createDefaultData() {

		employees.add(new Employee(
				1L,
				"Asiva",
				"asiva@example.com",
				"Developer",
				"IT",
				"Available",
				6
		));

		employees.add(new Employee(
				2L,
				"Arun",
				"arun@example.com",
				"Senior Developer",
				"IT",
				"Available",
				7
		));

		employees.add(new Employee(
				3L,
				"Priya",
				"priya@example.com",
				"UI Designer",
				"Design",
				"Available",
				5
		));

		employees.add(new Employee(
				4L,
				"Kumar",
				"kumar@example.com",
				"HR Executive",
				"HR",
				"Available",
				4
		));

		leaves.add(new LeaveRequest(
				1L,
				1L,
				"Sick",
				"2026-08-10",
				"2026-08-11",
				"Personal reason",
				"PENDING"
		));

		leaves.add(new LeaveRequest(
				2L,
				2L,
				"Casual",
				"2026-08-05",
				"2026-08-06",
				"Family function",
				"APPROVED"
		));

		leaves.add(new LeaveRequest(
				3L,
				3L,
				"Vacation",
				"2026-08-15",
				"2026-08-18",
				"Personal vacation",
				"REJECTED"
		));
	}


	// =========================================================
	// DASHBOARD
	// =========================================================

	@GetMapping("/dashboard")
	public ResponseEntity<Map<String, Object>> dashboard() {

		Map<String, Object> result =
				new LinkedHashMap<>();

		long pending = leaves.stream()
				.filter(l ->
						"PENDING".equalsIgnoreCase(l.status))
				.count();

		long approved = leaves.stream()
				.filter(l ->
						"APPROVED".equalsIgnoreCase(l.status))
				.count();

		long rejected = leaves.stream()
				.filter(l ->
						"REJECTED".equalsIgnoreCase(l.status))
				.count();

		long available = employees.stream()
				.filter(e ->
						"Available".equalsIgnoreCase(e.status))
				.count();

		long onLeave = employees.stream()
				.filter(e ->
						"On Leave".equalsIgnoreCase(e.status))
				.count();

		long highWorkload = employees.stream()
				.filter(e -> e.workload >= 8)
				.count();

		long continuityScore =
				employees.isEmpty()
						? 0
						: Math.round(
						(available * 100.0)
								/ employees.size()
				);

		result.put("totalEmployees", employees.size());
		result.put("pendingLeaves", pending);
		result.put("approvedLeaves", approved);
		result.put("rejectedLeaves", rejected);
		result.put("availableEmployees", available);
		result.put("employeesOnLeave", onLeave);
		result.put("highWorkloadEmployees", highWorkload);
		result.put("continuityScore", continuityScore);

		return ResponseEntity.ok(result);
	}


	// =========================================================
	// EMPLOYEES
	// =========================================================

	@GetMapping("/employees")
	public ResponseEntity<List<Employee>> getEmployees() {

		return ResponseEntity.ok(
				new ArrayList<>(employees)
		);
	}


	@GetMapping("/employees/{id}")
	public ResponseEntity<?> getEmployee(
			@PathVariable Long id) {

		Employee employee = findEmployee(id);

		if (employee == null) {

			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
					.body(Map.of(
							"success", false,
							"message",
							"Employee not found"
					));
		}

		return ResponseEntity.ok(employee);
	}


	@PostMapping("/employees")
	public ResponseEntity<?> addEmployee(
			@RequestBody Employee employee) {

		if (employee == null) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Employee data is required"
					));
		}

		if (isBlank(employee.name)) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Employee name is required"
					));
		}

		if (isBlank(employee.email)) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Employee email is required"
					));
		}

		if (isBlank(employee.role)) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Employee role is required"
					));
		}

		employee.id =
				employeeId.incrementAndGet();

		if (isBlank(employee.department)) {
			employee.department = "IT";
		}

		if (isBlank(employee.status)) {
			employee.status = "Available";
		}

		if (employee.workload < 1 ||
				employee.workload > 10) {

			employee.workload = 5;
		}

		employees.add(employee);

		// SAVE TO JSON
		DataStorage.saveEmployees(employees);

		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(employee);
	}


	@PutMapping("/employees/{id}")
	public ResponseEntity<?> updateEmployee(
			@PathVariable Long id,
			@RequestBody Employee updated) {

		Employee employee = findEmployee(id);

		if (employee == null) {

			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
					.body(Map.of(
							"success", false,
							"message",
							"Employee not found"
					));
		}

		if (!isBlank(updated.name)) {
			employee.name = updated.name;
		}

		if (!isBlank(updated.email)) {
			employee.email = updated.email;
		}

		if (!isBlank(updated.role)) {
			employee.role = updated.role;
		}

		if (!isBlank(updated.department)) {
			employee.department =
					updated.department;
		}

		if (!isBlank(updated.status)) {
			employee.status =
					updated.status;
		}

		if (updated.workload >= 1 &&
				updated.workload <= 10) {

			employee.workload =
					updated.workload;
		}

		// SAVE TO JSON
		DataStorage.saveEmployees(employees);

		return ResponseEntity.ok(employee);
	}


	@DeleteMapping("/employees/{id}")
	public ResponseEntity<Map<String, Object>>
	deleteEmployee(@PathVariable Long id) {

		Employee employee = findEmployee(id);

		if (employee == null) {

			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
					.body(Map.of(
							"success", false,
							"message",
							"Employee not found"
					));
		}

		employees.remove(employee);

		leaves.removeIf(
				leave ->
						Objects.equals(
								leave.employeeId,
								id
						)
		);

		replacements.removeIf(
				replacement ->
						Objects.equals(
								replacement.absentEmployeeId,
								id
						) ||
								Objects.equals(
										replacement.replacementEmployeeId,
										id
								)
		);

		saveAllData();

		return ResponseEntity.ok(
				Map.of(
						"success", true,
						"message",
						"Employee deleted successfully"
				)
		);
	}


	// =========================================================
	// LEAVES
	// =========================================================

	@GetMapping("/leaves")
	public ResponseEntity<List<LeaveRequest>>
	getLeaves() {

		return ResponseEntity.ok(
				new ArrayList<>(leaves)
		);
	}


	@GetMapping("/leaves/{id}")
	public ResponseEntity<?> getLeave(
			@PathVariable Long id) {

		LeaveRequest leave = findLeave(id);

		if (leave == null) {

			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
					.body(Map.of(
							"success", false,
							"message",
							"Leave request not found"
					));
		}

		return ResponseEntity.ok(leave);
	}


	@PostMapping("/leaves")
	public ResponseEntity<?> applyLeave(
			@RequestBody LeaveRequest leave) {

		if (leave == null) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Leave data is required"
					));
		}

		if (leave.employeeId == null) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Employee must be selected"
					));
		}

		Employee employee =
				findEmployee(leave.employeeId);

		if (employee == null) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Selected employee does not exist"
					));
		}

		if (isBlank(leave.startDate) ||
				isBlank(leave.endDate)) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Start date and end date are required"
					));
		}

		if (isBlank(leave.leaveType)) {
			leave.leaveType = "Casual";
		}

		if (isBlank(leave.reason)) {
			leave.reason = "No reason provided";
		}

		leave.id =
				leaveId.incrementAndGet();

		leave.status = "PENDING";

		leaves.add(leave);

		// SAVE TO JSON
		DataStorage.saveLeaves(leaves);

		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(leave);
	}


	// =========================================================
	// APPROVE LEAVE
	// =========================================================

	@PutMapping("/leaves/{id}/approve")
	public ResponseEntity<?> approveLeave(
			@PathVariable Long id) {

		LeaveRequest leave = findLeave(id);

		if (leave == null) {

			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
					.body(Map.of(
							"success", false,
							"message",
							"Leave request not found"
					));
		}

		leave.status = "APPROVED";

		Employee employee =
				findEmployee(leave.employeeId);

		if (employee != null) {
			employee.status = "On Leave";
		}

		// SAVE BOTH
		saveAllData();

		return ResponseEntity.ok(leave);
	}


	// =========================================================
	// REJECT LEAVE
	// =========================================================

	@PutMapping("/leaves/{id}/reject")
	public ResponseEntity<?> rejectLeave(
			@PathVariable Long id) {

		LeaveRequest leave = findLeave(id);

		if (leave == null) {

			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
					.body(Map.of(
							"success", false,
							"message",
							"Leave request not found"
					));
		}

		leave.status = "REJECTED";

		// SAVE TO JSON
		DataStorage.saveLeaves(leaves);

		return ResponseEntity.ok(leave);
	}


	// =========================================================
	// CALENDAR
	// =========================================================

	@GetMapping("/calendar")
	public ResponseEntity<List<LeaveRequest>>
	getCalendar() {

		return ResponseEntity.ok(
				new ArrayList<>(leaves)
		);
	}


	// =========================================================
	// ANALYTICS
	// =========================================================

	@GetMapping("/analytics")
	public ResponseEntity<Map<String, Object>>
	analytics() {

		Map<String, Object> result =
				new LinkedHashMap<>();

		long available = employees.stream()
				.filter(e ->
						"Available".equalsIgnoreCase(
								e.status))
				.count();

		long onLeave = employees.stream()
				.filter(e ->
						"On Leave".equalsIgnoreCase(
								e.status))
				.count();

		long pending = leaves.stream()
				.filter(l ->
						"PENDING".equalsIgnoreCase(
								l.status))
				.count();

		long approved = leaves.stream()
				.filter(l ->
						"APPROVED".equalsIgnoreCase(
								l.status))
				.count();

		long rejected = leaves.stream()
				.filter(l ->
						"REJECTED".equalsIgnoreCase(
								l.status))
				.count();

		result.put("employees",
				employees.size());

		result.put("available",
				available);

		result.put("onLeave",
				onLeave);

		result.put("pending",
				pending);

		result.put("approved",
				approved);

		result.put("rejected",
				rejected);

		Map<String, Integer> departments =
				new LinkedHashMap<>();

		for (Employee employee : employees) {

			String department =
					isBlank(employee.department)
							? "Other"
							: employee.department;

			departments.put(
					department,
					departments.getOrDefault(
							department,
							0
					) + 1
			);
		}

		result.put(
				"departments",
				departments
		);

		return ResponseEntity.ok(result);
	}


	// =========================================================
	// WORKFORCE
	// =========================================================

	@GetMapping("/workforce")
	public ResponseEntity<Map<String, Object>>
	workforce() {

		List<Employee> available =
				employees.stream()
						.filter(e ->
								"Available"
										.equalsIgnoreCase(
												e.status))
						.toList();

		List<Employee> highWorkload =
				employees.stream()
						.filter(e ->
								e.workload >= 8)
						.toList();

		List<Employee> onLeave =
				employees.stream()
						.filter(e ->
								"On Leave"
										.equalsIgnoreCase(
												e.status))
						.toList();

		Map<String, Object> result =
				new LinkedHashMap<>();

		result.put(
				"total",
				employees.size()
		);

		result.put(
				"available",
				available.size()
		);

		result.put(
				"onLeave",
				onLeave.size()
		);

		result.put(
				"highWorkload",
				highWorkload.size()
		);

		result.put(
				"availabilityPercentage",
				employees.isEmpty()
						? 0
						: Math.round(
						available.size()
								* 100.0
								/ employees.size()
				)
		);

		result.put(
				"employees",
				new ArrayList<>(employees)
		);

		return ResponseEntity.ok(result);
	}


	// =========================================================
	// REPLACEMENT SUGGESTIONS
	// =========================================================

	@GetMapping(
			"/replacement/suggestions/{employeeId}"
	)
	public ResponseEntity<List<Employee>>
	replacementSuggestions(
			@PathVariable Long employeeId) {

		Employee absent =
				findEmployee(employeeId);

		if (absent == null) {

			return ResponseEntity.ok(
					Collections.emptyList()
			);
		}

		List<Employee> suggestions =
				employees.stream()

						.filter(e ->
								!Objects.equals(
										e.id,
										employeeId
								))

						.filter(e ->
								"Available"
										.equalsIgnoreCase(
												e.status
										))

						.filter(e ->
								e.workload < 8
						)

						.sorted(
								Comparator
										.comparingInt(
												(Employee e) -> {

													int score = 0;

													if (e.role != null &&
															absent.role != null &&
															e.role.equalsIgnoreCase(
																	absent.role
															)) {

														score -= 100;
													}

													if (e.department != null &&
															absent.department != null &&
															e.department.equalsIgnoreCase(
																	absent.department
															)) {

														score -= 50;
													}

													return score;
												}
										)

										.thenComparingInt(
												e ->
														e.workload
										)
						)

						.limit(5)

						.toList();

		return ResponseEntity.ok(
				suggestions
		);
	}


	// =========================================================
	// ASSIGN REPLACEMENT
	// =========================================================

	@PostMapping("/replacement")
	public ResponseEntity<?> assignReplacement(
			@RequestBody ReplacementRequest request) {

		if (request == null) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Replacement request is required"
					));
		}

		if (request.employeeId == null ||
				request.replacementEmployeeId == null) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Employee IDs are required"
					));
		}

		Employee absent =
				findEmployee(
						request.employeeId
				);

		Employee replacement =
				findEmployee(
						request.replacementEmployeeId
				);

		if (absent == null) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Absent employee not found"
					));
		}

		if (replacement == null) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Replacement employee not found"
					));
		}

		if (Objects.equals(
				absent.id,
				replacement.id
		)) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Employee cannot replace themselves"
					));
		}

		if (!"Available".equalsIgnoreCase(
				replacement.status
		)) {

			return ResponseEntity.badRequest()
					.body(Map.of(
							"success", false,
							"message",
							"Replacement employee is not available"
					));
		}

		Replacement replacementRecord =
				new Replacement(
						replacementId.incrementAndGet(),
						absent.id,
						absent.name,
						replacement.id,
						replacement.name,
						"ASSIGNED",
						LocalDate.now().toString()
				);

		replacements.add(
				replacementRecord
		);

		replacement.workload =
				Math.min(
						10,
						replacement.workload + 1
				);

		// SAVE ALL
		saveAllData();

		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(replacementRecord);
	}


	// =========================================================
	// GET REPLACEMENTS
	// =========================================================

	@GetMapping("/replacements")
	public ResponseEntity<List<Replacement>>
	getReplacements() {

		return ResponseEntity.ok(
				new ArrayList<>(replacements)
		);
	}


	// =========================================================
	// NOTIFICATIONS
	// =========================================================

	@GetMapping("/notifications")
	public ResponseEntity<List<Map<String, String>>>
	notifications() {

		List<Map<String, String>> result =
				new ArrayList<>();

		long pending = leaves.stream()
				.filter(l ->
						"PENDING".equalsIgnoreCase(
								l.status))
				.count();

		long onLeave = employees.stream()
				.filter(e ->
						"On Leave".equalsIgnoreCase(
								e.status))
				.count();

		long highWorkload = employees.stream()
				.filter(e ->
						e.workload >= 8)
				.count();

		if (pending > 0) {

			result.add(
					Map.of(
							"type",
							"warning",
							"message",
							pending +
									" leave request(s) waiting for approval"
					)
			);
		}

		if (onLeave > 0) {

			result.add(
					Map.of(
							"type",
							"info",
							"message",
							onLeave +
									" employee(s) currently on leave"
					)
			);
		}

		if (highWorkload > 0) {

			result.add(
					Map.of(
							"type",
							"warning",
							"message",
							highWorkload +
									" employee(s) have high workload"
					)
			);
		}

		if (result.isEmpty()) {

			result.add(
					Map.of(
							"type",
							"success",
							"message",
							"Workforce is operating normally"
					)
			);
		}

		return ResponseEntity.ok(result);
	}


	// =========================================================
	// HEALTH
	// =========================================================

	@GetMapping("/health")
	public ResponseEntity<Map<String, String>>
	health() {

		return ResponseEntity.ok(
				Map.of(
						"status",
						"ONLINE",
						"message",
						"Workforce System backend is running"
				)
		);
	}


	// =========================================================
	// HELPER METHODS
	// =========================================================

	private Employee findEmployee(Long id) {

		if (id == null) {
			return null;
		}

		return employees.stream()
				.filter(e ->
						Objects.equals(
								e.id,
								id
						))
				.findFirst()
				.orElse(null);
	}


	private LeaveRequest findLeave(Long id) {

		if (id == null) {
			return null;
		}

		return leaves.stream()
				.filter(l ->
						Objects.equals(
								l.id,
								id
						))
				.findFirst()
				.orElse(null);
	}


	private boolean isBlank(String value) {

		return value == null ||
				value.trim().isEmpty();
	}


	// =========================================================
	// EMPLOYEE MODEL
	// =========================================================

	public static class Employee {

		public Long id;

		public String name;

		public String email;

		public String role;

		public String department;

		public String status;

		public int workload;


		public Employee() {
		}


		public Employee(
				Long id,
				String name,
				String email,
				String role,
				String department,
				String status,
				int workload) {

			this.id = id;
			this.name = name;
			this.email = email;
			this.role = role;
			this.department = department;
			this.status = status;
			this.workload = workload;
		}
	}


	// =========================================================
	// LEAVE MODEL
	// =========================================================

	public static class LeaveRequest {

		public Long id;

		public Long employeeId;

		public String leaveType;

		public String startDate;

		public String endDate;

		public String reason;

		public String status;


		public LeaveRequest() {
		}


		public LeaveRequest(
				Long id,
				Long employeeId,
				String leaveType,
				String startDate,
				String endDate,
				String reason,
				String status) {

			this.id = id;
			this.employeeId = employeeId;
			this.leaveType = leaveType;
			this.startDate = startDate;
			this.endDate = endDate;
			this.reason = reason;
			this.status = status;
		}
	}


	// =========================================================
	// REPLACEMENT MODEL
	// =========================================================

	public static class Replacement {

		public Long id;

		public Long absentEmployeeId;

		public String absentEmployee;

		public Long replacementEmployeeId;

		public String replacementEmployee;

		public String status;

		public String assignedDate;


		// IMPORTANT FOR JSON
		public Replacement() {
		}


		public Replacement(
				Long id,
				Long absentEmployeeId,
				String absentEmployee,
				Long replacementEmployeeId,
				String replacementEmployee,
				String status,
				String assignedDate) {

			this.id = id;

			this.absentEmployeeId =
					absentEmployeeId;

			this.absentEmployee =
					absentEmployee;

			this.replacementEmployeeId =
					replacementEmployeeId;

			this.replacementEmployee =
					replacementEmployee;

			this.status = status;

			this.assignedDate =
					assignedDate;
		}
	}


	// =========================================================
	// REPLACEMENT REQUEST
	// =========================================================

	public static class ReplacementRequest {

		public Long employeeId;

		public Long replacementEmployeeId;


		public ReplacementRequest() {
		}
	}


	// =========================================================
	// MAIN
	// =========================================================

	public static void main(String[] args) {

		SpringApplication.run(
				WorkforceContinuitySystemApplication.class,
				args
		);
	}
}