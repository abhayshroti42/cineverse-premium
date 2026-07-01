import { useEffect, useState } from "react";
import API from "../services/api";

function Profile() {

  const [profile, setProfile] =
    useState(null);

  useEffect(() => {

    API.get("/profile/1")
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  if (!profile) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>

      <h1>Profile</h1>

      <h3>ID: {profile.id}</h3>

      <h3>
        Username:
        {profile.username}
      </h3>

      <h3>
        Email:
        {profile.email}
      </h3>

    </div>
  );
}

export default Profile;