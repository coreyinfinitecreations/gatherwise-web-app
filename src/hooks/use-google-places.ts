import { useEffect, useRef, useState } from "react";

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export function useGooglePlaces(
  inputRef: React.RefObject<HTMLInputElement>,
  onAddressSelect: (components: AddressComponents) => void,
  isActive: boolean = true
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (typeof window === "undefined") return;

      if (window.google?.maps?.places) {
        console.log("Google Maps already loaded");
        setIsLoaded(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );

      if (existingScript) {
        console.log("Google Maps script exists, waiting for load...");
        const checkGoogleLoaded = setInterval(() => {
          if (window.google?.maps?.places) {
            console.log("Google Maps loaded via existing script");
            setIsLoaded(true);
            clearInterval(checkGoogleLoaded);
          }
        }, 100);

        setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.error("Google Maps API key is not configured");
        return;
      }

      console.log("Loading Google Maps script...");
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps script");
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (!isActive || !isLoaded || !inputRef.current) {
      console.log("Google Places not ready:", {
        isActive,
        isLoaded,
        hasInput: !!inputRef.current,
      });
      return;
    }

    const initAutocomplete = async () => {
      const input = inputRef.current;
      if (!input) {
        console.log("Input ref is null, skipping autocomplete init");
        return;
      }

      if (autocompleteRef.current) {
        console.log("Cleaning up existing autocomplete instance");
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }

      console.log(
        "Initializing Google Places Autocomplete for input:",
        input.id
      );

      try {
        autocompleteRef.current = new google.maps.places.Autocomplete(input, {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["address_components", "formatted_address"],
        });

        console.log("Autocomplete initialized successfully");

        const listener = autocompleteRef.current.addListener(
          "place_changed",
          () => {
            const place = autocompleteRef.current?.getPlace();
            console.log("Place selected:", place);

            if (!place || !place.address_components) return;

            const components = place.address_components;
            let street = "";
            let city = "";
            let state = "";
            let zipCode = "";

            const streetNumber =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("street_number")
              )?.long_name || "";

            const route =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("route")
              )?.long_name || "";

            street = `${streetNumber} ${route}`.trim();

            city =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("locality")
              )?.long_name || "";

            state =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("administrative_area_level_1")
              )?.short_name || "";

            zipCode =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("postal_code")
              )?.long_name || "";

            onAddressSelect({
              street,
              city,
              state,
              zipCode,
              fullAddress: place.formatted_address || "",
            });
          }
        );

        return () => {
          if (listener) {
            google.maps.event.removeListener(listener);
          }
        };
      } catch (error) {
        console.error("Error initializing Google Places:", error);
      }
    };

    const timeoutId = setTimeout(initAutocomplete, 200);

    return () => {
      clearTimeout(timeoutId);
      if (autocompleteRef.current) {
        console.log("Cleaning up autocomplete on unmount");
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isActive, isLoaded, inputRef, onAddressSelect]);

  return { isLoaded };
}
