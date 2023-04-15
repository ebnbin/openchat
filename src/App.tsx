import React, {useEffect, useState} from 'react';
import AppPage from "./business/app/AppPage";
import store from "./util/store";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      await store.migrate()
      setIsLoading(false)
    }
    load();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    isLoading ? (<></>) : (<AppPage/>)
  )
}
