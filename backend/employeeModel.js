const db = require("./db");

exports.getAll = async () => {
    const [rows] = await db.query("SELECT * FROM employees ORDER BY id DESC");
    return rows;
};

exports.getById = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM employees WHERE id = ?", [id]
    );
    return rows[0];
};

exports.create = async (employee) => {
    const {
        employee_id, name, email, phone,
        department, designation, salary, joining_date
    } = employee;

    const [result] = await db.query(
        `INSERT INTO employees
        (employee_id, name, email, phone, department,
         designation, salary, joining_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, name, email, phone, department,
         designation, salary, joining_date || null]
    );

    return result.insertId;
};

exports.update = async (id, employee) => {
    const {
        employee_id, name, email, phone,
        department, designation, salary, joining_date
    } = employee;

    const [result] = await db.query(
        `UPDATE employees SET employee_id=?, name=?, email=?,
         phone=?, department=?, designation=?, salary=?,
         joining_date=? WHERE id=?`,
        [employee_id, name, email, phone, department,
         designation, salary, joining_date || null, id]
    );

    return result.affectedRows;
};

exports.remove = async (id) => {
    const [result] = await db.query(
        "DELETE FROM employees WHERE id = ?", [id]
    );
    return result.affectedRows;
};
