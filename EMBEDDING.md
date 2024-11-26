# Embedding the Publications Repository
If you want to embed the publications list onto your own website, you may make use of the pre-generated HTML overview to quickly and easily integrate the list. There are limited options for styling the generated HTML to accomodate your webpage.

An example embedding using javascript:
```
<style>
  .pub-title {
      margin-top: 20px;
      color: #006eb7 !important;
      padding-bottom: 3px;
  }
  .italic {    
      font-style: italic;
  }
  .pub-cat {
      margin-top: 39px;
  }
  #pub-div {
      max-width: 820px;
  }
</style>
<div id="pub-div">
  <p>Please enable JavaScript to see the publications list.</p>
</div>

  <script type="text/javascript">
    async function fetchPubs() {
      const targetDiv = document.getElementById('pub-div');
      const remoteUrl = 'https://jeltevanbommel.github.io/scion-publications/index.html'; 

      try {
        // Fetch the publication list
        const response = await fetch(remoteUrl);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const htmlContent = await response.text();

        // Add the publications to the target div
        targetDiv.innerHTML = htmlContent;
      } catch (error) {
        console.error('Failed to fetch publications:', error);
      }
    }
    fetchPubs();
  </script>
``` 