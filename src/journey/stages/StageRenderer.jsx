import StageAsteroids from "./StageAsteroids";
import StageBlackHole from "./StageBlackHole";
import StageEarth from "./StageEarth";
import StageGalaxy from "./StageGalaxy";
import StageGasCloud from "./StageGasCloud";
import StageInsideHorizon from "./StageInsideHorizon";
import StageMoon from "./StageMoon";
import StageSolarSystem from "./StageSolarSystem";
import StageSun from "./StageSun";
import StageSupernova from "./StageSupernova";

export default function StageRenderer({ stageKey, onEnterArchive }) {
  switch (stageKey) {
    case "earth":
      return <StageEarth />;
    case "moon":
      return <StageMoon />;
    case "sun":
      return <StageSun />;
    case "system":
      return <StageSolarSystem />;
    case "asteroids":
      return <StageAsteroids />;
    case "gas":
      return <StageGasCloud />;
    case "supernova":
      return <StageSupernova />;
    case "galaxy":
      return <StageGalaxy />;
    case "blackhole":
      return <StageBlackHole onEnterArchive={onEnterArchive} />;
    case "inside":
      return <StageInsideHorizon />;
    default:
      return null;
  }
}
