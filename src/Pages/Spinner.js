// Spinner.js
import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
}));

const Spinner = () => {
  const classes = useStyles();
  return (
    <div className={classes.spinnerContainer}>
      <CircularProgress />
    </div>
  );
};

export default Spinner;
