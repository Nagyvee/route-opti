import React, { createRef } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import { services } from "@tomtom-international/web-sdk-services";
import SearchBox from "./Map";

import "./App.css";

const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.mapElement = createRef();
    this.liveLocationMarker = null;

    this.state = {
      markers: [],
      currentLocation: null,
      routeInfo: null,
      googleMapsUrl: null,
    };
  }

  componentDidMount() {
    this.initMap();
  }

  initMap = () => {
    this.map = tt.map({
      key: API_KEY,
      container: this.mapElement.current,
      center: [0, 0], // Default center, will be updated later
      zoom: 14,
    });

    this.map.addControl(new tt.NavigationControl());

    this.map.on("click", this.handleMapClick);

    // Start tracking live location
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.setState({ currentLocation: [longitude, latitude] }, () => {
            if (!this.liveLocationMarker) {
              this.liveLocationMarker = new tt.Marker()
                .setLngLat([longitude, latitude])
                .addTo(this.map);
            } else {
              this.liveLocationMarker.setLngLat([longitude, latitude]);
            }
          });
        },
        (error) => {
          console.error("Error getting live location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  handleMapClick = (event) => {
    this.addMarkerAtLngLat(event.lngLat);
  };

  addMarkerAtLngLat = (lngLat) => {
    const { markers } = this.state;

    if (markers.length < 10) {
      const marker = new tt.Marker().setLngLat(lngLat).addTo(this.map);
      this.setState({ markers: [...markers, marker] });
    }
  };

  calculateRoute = async () => {
    const { markers, currentLocation } = this.state;

    if (markers.length < 2 || !currentLocation) return;

    const key = API_KEY;
    const locations = [currentLocation, ...markers.map((marker) => marker.getLngLat())];

    try {
      const response = await services.calculateRoute({
        key,
        locations,
      });

      const route = response.routes[0];
      const routeInfo = {
        distance: route.summary.lengthInMeters,
        arrivalTime: new Date(Date.now() + route.summary.travelTimeInSeconds * 1000),
      };

      const googleMapsUrl = this.createGoogleMapsUrl(locations);

      this.setState({ routeInfo, googleMapsUrl });

      this.map.removeLayer("route"); // Remove existing route layer if present

      this.map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          },
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#07f",
          "line-width": 8,
        },
      });

      const bounds = new tt.LngLatBounds();

      locations.forEach((location) => {
        bounds.extend(location);
      });

      this.map.fitBounds(bounds, { padding: 100 });
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  createGoogleMapsUrl = (locations) => {
    const baseUrl = 'https://www.google.com/maps/dir/?api=1';
    const origin = `&origin=${locations[0][1]},${locations[0][0]}`;
    const destination = `&destination=${locations[locations.length - 1][1]},${locations[locations.length - 1][0]}`;
    const waypoints = locations.slice(1, -1).map(coord => `${coord[1]},${coord[0]}`).join('|');
    const waypointsParam = waypoints ? `&waypoints=${waypoints}` : '';

    return `${baseUrl}${origin}${destination}${waypointsParam}`;
  };

  clear = () => {
    const { markers } = this.state;

    markers.forEach((marker) => marker.remove());
    this.setState({ markers: [], routeInfo: null, googleMapsUrl: null });
    this.map.removeLayer("route");
  };

  render() {
    const { routeInfo, googleMapsUrl } = this.state;

    return (
      <div className="App">
        <SearchBox onPlaceSelect={this.addMarkerAtLngLat} />
        <div ref={this.mapElement} className="mapDiv"></div>
        <button className="clearButton" onClick={this.clear}>
          Clear
        </button>
        <button className="routeButton" onClick={this.calculateRoute}>
          Calculate Route
        </button>
        {googleMapsUrl && (
          <button className="navigateButton" onClick={() => window.open(googleMapsUrl, '_blank')}>
            Navigate with Google Maps
          </button>
        )}
        {routeInfo && (
          <div className="routeInfo">
            <p>Remaining Distance: {routeInfo.distance} meters</p>
            <p>Arrival Time: {routeInfo.arrivalTime.toLocaleString()}</p>
          </div>
        )}
      </div>
    );
  }
}

export default App;
