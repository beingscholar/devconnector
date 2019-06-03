import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const ProfileAbout = ({
  profile: {
    bio,
    skills,
    user: { name }
  }
}) => {
  return (
    <Fragment>
      <div className="profile-about bg-light p-2">
        <h2 className="text-primary">{name.split(' ')[0]}'s Bio</h2>
        <p>{bio && <span>{bio}</span>}</p>
        <div className="line" />
        <h2 className="text-primary">Skill Set</h2>
        <div className="skills">
          {skills.map((skill, index) => (
            <div key={index} className="p-1">
              <i className="fa fa-check" /> {skill}
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

ProfileAbout.propTypes = {
  profile: PropTypes.object.isRequired
};

export default ProfileAbout;
