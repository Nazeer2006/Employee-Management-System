const Employee = require("./employeeModel");

exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.getAll();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEmployee = async (req, res) => {
    try {
        const employee = await Employee.getById(req.params.id);

        if (!employee)
            return res.status(404).json({ message: "Employee not found" });

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addEmployee = async (req, res) => {
    try {
        const { employee_id, name, email, department, designation, salary } = req.body;

        if (!employee_id || !name || !email || !department || !designation || salary === undefined)
            return res.status(400).json({ message: "Please provide all required fields" });

        const id = await Employee.create(req.body);
        res.status(201).json({ message: "Employee added successfully", id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const result = await Employee.update(req.params.id, req.body);

        if (!result)
            return res.status(404).json({ message: "Employee not found" });

        res.json({ message: "Employee updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const result = await Employee.remove(req.params.id);

        if (!result)
            return res.status(404).json({ message: "Employee not found" });

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
