
      window.addEventListener("message", (event) => {
        if (event.origin !== "https://trusted.example") return;
        eval(event.data);
      });
    