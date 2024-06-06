import { useEffect } from "react";
import tt from "@tomtom-international/web-sdk-maps"

const Map = () =>{
    useEffect(()=>{
      const map = tt.map ({
        key: "",
        container: 'map',
        center: [0, 0],
        zoom:14,
        style: 'tomtom://vectoir/1/basic'
      });
      return () => map.remove();
    }, []);

    return <div id="map" style={{width:'100vw' ,height: '75vh'}}/>
}

export default Map;