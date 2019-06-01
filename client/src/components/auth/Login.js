import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
// import Config from '../../apis/Config';

const Login = () => {
  const [formData, setformData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const onChange = e =>
    setformData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    console.log(formData);
    /* const newUser = { email, password };

    try {
      const body = JSON.stringify(newUser);
      const response = await Config.post('/api/auth', body);

      console.log(response.data);
    } catch (err) {
      console.error(err.response.data);
    } */
  };

  return (
    <Fragment>
      {/* <div className="alert alert-danger">Invalid credentials</div> */}
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead">
        <i className="fas fa-user" /> Sign into Your Account
      </p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={e => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={e => onChange(e)}
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </Fragment>
  );
};

export default Login;
