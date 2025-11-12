function handleSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log("hello " + username + " your password is : " + password);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    fetch("/submit-data", {
        method: "POST",
        body: formData,
    })
        .then(response => response.json())
        .then(result => {
            console.log("Success:", result);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function LoginForm() {
    return (
        <form className="login-form" id="login-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                />
            </div>
            <button type="submit">Login</button>
        </form>
    );
}

export default LoginForm;
