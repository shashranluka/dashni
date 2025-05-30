import { useState, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./About.module.scss";

export default function About({ desc }) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const buttonRef = useRef(null);

  const toggleAbout = () => setIsAboutOpen((prev) => !prev);

  return (
    <section className={styles.about}>
      <button
        ref={buttonRef}
        className={styles.aboutToggle}
        onClick={toggleAbout}
        aria-expanded={isAboutOpen}
      >
        აღწერა
      </button>

      {isAboutOpen && (
        <div className={styles.aboutModal}>
          <div className={styles.aboutContent}>
            <h2 className={styles.aboutHeader}>
              {desc.h2}
              <button
                className={styles.closeButton}
                onClick={toggleAbout}
                aria-label="დახურვა"
              >
                ✕
              </button>
            </h2>
            <p className={styles.aboutParagraph}>{desc.p}</p>
          </div>
        </div>
      )}
    </section>
  );
}

About.propTypes = {
  desc: PropTypes.shape({
    h2: PropTypes.string.isRequired,
    p: PropTypes.string.isRequired,
  }).isRequired,
};
