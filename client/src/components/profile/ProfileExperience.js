import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

const ProfileExperience = ({ experience }) => {
  return (
    <Fragment>
      <div className="profile-exp bg-white p-2">
        <h2 className="text-primary">Experience</h2>
        {experience.length > 0 &&
          experience.map(exp => (
            <div key={exp._id}>
              <h3 className="text-dark">
                {exp.company && <span>{exp.company}</span>}
              </h3>
              <p>
                <Moment format="MMM YYYY">{exp.from}</Moment> -{' '}
                {exp.to === null ? (
                  'Current'
                ) : (
                  <Moment format="MMM YYYY">{exp.to}</Moment>
                )}
              </p>
              <p>
                <strong>Position: </strong>
                {exp.title && <span>{exp.title}</span>}
              </p>
              <p>
                <strong>Description: </strong>
                {exp.description && <span>{exp.description}</span>}
              </p>
            </div>
          ))}
      </div>
    </Fragment>
  );
};

ProfileExperience.propTypes = {
  experience: PropTypes.array.isRequired
};

export default ProfileExperience;
