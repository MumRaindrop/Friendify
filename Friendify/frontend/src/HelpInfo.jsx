import { useNavigate } from "react-router-dom";
import FriendifyLogo from "./assets/Logo.png";

export default function HelpInfo() { // Sort of a Read me for the web app, has contact to be added as a user for the app
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: "3rem",
        }}
      >
        <img
          src={FriendifyLogo}
          alt="Friendify logo"
          style={{
            width: "36px",
            height: "36px",
            marginRight: "0.75rem",
          }}
        />
        <span
          style={{
            fontSize: "1.75rem",
            fontWeight: "bold",
            color: "#1DB954",
          }}
        >
          Friendify
        </span>
      </div>

      <div
        style={{
          maxWidth: "700px",
          width: "100%",
          backgroundColor: "#181818",
          borderRadius: "12px",
          padding: "2.5rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <h2
          style={{
            color: "#1DB954",
            marginBottom: "1rem",
          }}
        >
          About the Project
        </h2>

        <p
          style={{
            lineHeight: "1.7",
            color: "#e0e0e0",
            marginBottom: "2.5rem",
          }}
        >
          Welcome to Friendify — a web application made to bring your Spotify
          stats to your fingertips whenever you want. Almost like a Spotify
          Wrapped whenever you want it. When I use Spotify I would like to 
          be able to see what my top songs are, maybe see how long I've been
          listening and even share that info with my friends. Friendify lets
          you do that. For now Friendify is sort of a proof of concept and
          displays a user's top songs based on listening period. In the
          future more functions may be added such as listening time for the
          time periods. Other additions that could be added are leaderboards
          among your Friends for stats such as monthly listening time or artist
          dedication. Currently the app implements simple friend functions
          based on Spotify display name letting users see eachothers top 
          tracks.
          <br />
          <br />
          The site functions using an ASP.NET backend, a React/Node.js frontend,
          makes use of an online PostgreSQL database (Supabase), accesses
          Spotify’s API, and is fully hosted on Azure. The application functions
          by requesting a user's data on login/authentication through the Spotify
          api. The data received is then sent to update the data tables in the 
          Supabase database in order to reduce Spotify api requests. Then all
          other functions in the app are performed by accessing the database. 
          Users are able to add eachother as friends through Spotify display 
          name, where a request is generated. Once friends are added their
          relationship is saved in the database and the friends are then able
          to view the top tracks of eachother through the friends page.
        </p>

        <h2
          style={{
            color: "#1DB954",
            marginBottom: "1rem",
          }}
        >
          Request Access
        </h2>

        <p
          style={{
            lineHeight: "1.7",
            color: "#e0e0e0",
          }}
        >
          The site is only open to a select few since Spotify only allows up to 25
          users for developmental projects.
          <br />
          <br />
          Please reach out to request access to the site for evaluation or
          interest. Being added as a user requires your name and the email your
          Spotify account is linked to.
        </p>

        <p
          style={{
            marginTop: "1.5rem",
            fontWeight: "bold",
            color: "#1DB954",
          }}
        >
          albrechtspencer2@gmail.com
        </p>
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: "3rem",
          padding: "0.75rem 1.75rem",
          fontSize: "1rem",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#1DB954",
          color: "#000",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ← Back
      </button>
    </div>
  );
}
