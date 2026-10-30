
      window.onmessage = (e) => {
        if (e.origin === allowed) {
          document.write(e.data);
        }
      };
    