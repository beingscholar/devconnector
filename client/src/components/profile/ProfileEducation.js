import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

const ProfileEducation = ({ education }) => {
  return (
    <Fragment>
      <div className="profile-edu bg-white p-2">
        <h2 className="text-primary">Education</h2>
        {education.length > 0 &&
          education.map(edu => (
            <div key={edu._id}>
              <h3>{edu.school && <span>{edu.school}</span>}</h3>
              <p>
                <Moment format="MMM YYYY">{edu.from}</Moment> -{' '}
                {edu.to === null ? (
                  'Now'
                ) : (
                  <Moment format="MMM YYYY">{edu.to}</Moment>
                )}
              </p>
              <p>
                <strong>Degree: </strong>
                {edu.degree && <span>{edu.degree}</span>}
              </p>
              <p>
                <strong>Field Of Study: </strong>
                {edu.fieldofstudy && <span>{edu.fieldofstudy}</span>}
              </p>
              <p>
                <strong>Description: </strong>
                {edu.description && <span>{edu.description}</span>}
              </p>
            </div>
          ))}
      </div>
    </Fragment>
  );
};

ProfileEducation.propTypes = {
  education: PropTypes.array.isRequired
};

export default ProfileEducation;
