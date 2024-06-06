import { useEffect } from "react";
import tt from "@tomtom-international/web-sdk-maps";

const Map = () => {
  useEffect(() => {
    const map = tt.map({
      key: "8QUXut0Wm1k4FAdTrmPxLjWw3uK0oKOn",
      container: "map",
      center: [0, 0],
      zoom: 14,
      style: {
        map: "2/basic_street-light-driving",
        poi: "2/poi_light",
        trafficIncidents: "2/incidents_light",
        trafficFlow: "2/flow_relative-light",
      },
    });
    return () => map.remove();
  }, []);

  return <div id="map" style={{ width: "100vw", height: "75vh" }} />;
};

export default Map;
