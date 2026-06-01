import { useEffect, useRef } from "react";
import "./EpisodePicker.scss";

function EpisodePicker({
  episodes,
  activeEpisodeId,
  setSelectedEpisode,
  setSeekTrigger,
}) {
  const episodeButtonRefs = useRef(new Map());

  useEffect(() => {
    if (activeEpisodeId == null) return;

    const activeButton = episodeButtonRefs.current.get(String(activeEpisodeId));
    if (!activeButton) return;

    activeButton.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeEpisodeId]);

  const handleSelectEpisode = (episode) => {
    setSelectedEpisode(episode);
    // დროის გადახტომას AudioPlayer აკეთებს startTime + seekTrigger-ით.
    setSeekTrigger((prev) => prev + 1);
  };

  if (!episodes.length) return null;

  return (
    <div className="poligon-page__episode-picker" aria-label="ეპიზოდის არჩევა">
      {episodes.map((episode) => {
        const isActive = String(activeEpisodeId) === String(episode.id);

        return (
          <button
            key={episode.id}
            ref={(el) => {
              const key = String(episode.id);
              if (el) {
                episodeButtonRefs.current.set(key, el);
              } else {
                episodeButtonRefs.current.delete(key);
              }
            }}
            type="button"
            className={`poligon-page__episode-btn${isActive ? " is-active" : ""}`}
            onClick={() => handleSelectEpisode(episode)}
            aria-pressed={isActive}
            title={`${episode.id} (${episode.time})`}
          >
            {episode.id} ({episode.time})
          </button>
        );
      })}
    </div>
  );
}

export default EpisodePicker;