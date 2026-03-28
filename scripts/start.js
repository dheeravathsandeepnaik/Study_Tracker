const { spawn } = require("child_process");
const backend = spawn("npm", ["run", "dev"], { cwd: "backend", stdio: "inherit" });
const frontend = spawn("npm", ["run", "dev"], { cwd: "frontend", stdio: "inherit" });

