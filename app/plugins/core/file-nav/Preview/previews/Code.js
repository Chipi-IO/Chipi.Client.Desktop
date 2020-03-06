import React from "react";
import PropTypes from "prop-types";
import WithFetchedFile from "./WithFetchedFile";
import Prism from "prismjs";
import styles from "./styles/index.css";

// prism.css theme
import "./styles/prism.css";

const Highlight = ({ source, lang }) => {
  const prismLang = Prism.languages[lang] || Prism.languages.markup;
  const innerHtml = {
    __html: Prism.highlight(source, prismLang)
  };
  return (
    <pre className={`language-${lang}`}>
      <code
        className={`language-${lang}`}
        dangerouslySetInnerHTML={innerHtml}
      />
    </pre>
  );
};

Highlight.propTypes = {
  source: PropTypes.string.isRequired,
  lang: PropTypes.string
};

const Code = ({ path }) => {
  const lang = path.match(/\.([^\.]+)$/)[1];
  return (
    <WithFetchedFile path={path}>
      {source => (
        <div className={styles.previewCode}>
          <Highlight source={source} lang={lang} />
        </div>
      )}
    </WithFetchedFile>
  );
};

Code.propTypes = {
  path: PropTypes.string.isRequired
};

export default Code;
