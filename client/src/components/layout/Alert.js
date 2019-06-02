import React from 'react';
import PropTypes from 'prop-types';
import { removeAlert } from '../../actions/alert';

import { connect } from 'react-redux';

const Alert = ({ alerts, removeAlert }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map(({ id, msg, alertType }) => (
    <div key={id} className={`alert alert-${alertType}`}>
      {msg}
      <p className="remove-alert" onClick={e => removeAlert(id)}>
        <i className="fas fa-times-circle" />
      </p>
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
  removeAlert: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  alerts: state.alert
});

export default connect(
  mapStateToProps,
  { removeAlert }
)(Alert);
