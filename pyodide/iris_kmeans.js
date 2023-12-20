importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/wheels/bokeh-3.3.2-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.3.6/dist/wheels/panel-1.3.6-py3-none-any.whl', 'pyodide-http==0.2.1', 'hvplot', 'scikit-learn']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import numpy as np
import pandas as pd
import panel as pn
import hvplot.pandas

from sklearn.cluster import KMeans
from bokeh.sampledata import iris

pn.extension(design='material', template='material')


# This app provides an example of building a simple dashboard using Panel. It demonstrates how to take the output of  k-means clustering on the Iris dataset (performed using scikit-learn), parameterizing the number of clusters and the x and y variables to plot. The entire clustering and plotting pipeline is expressed as a single reactive function that returns a plot that responsively updates when one of the widgets changes.

# In[ ]:


flowers = iris.flowers.copy()
cols = list(flowers.columns)[:-1]

x = pn.widgets.Select(name='x', options=cols)
y = pn.widgets.Select(name='y', options=cols, value='sepal_width')
n_clusters = pn.widgets.IntSlider(name='n_clusters', start=1, end=5, value=3)

def get_clusters(x, y, n_clusters):
    kmeans = KMeans(n_clusters=n_clusters, n_init='auto')
    est = kmeans.fit(iris.flowers.iloc[:, :-1].values)
    flowers['labels'] = est.labels_.astype('str')
    centers = flowers.groupby('labels')[[x] if x == y else [x, y]].mean()
    return (
        flowers.sort_values('labels').hvplot.scatter(
            x, y, c='labels', size=100, height=500, responsive=True
        ) *
        centers.hvplot.scatter(
            x, y, marker='x', c='black', size=400, padding=0.1, line_width=5
        )
    )

pn.Row(
    pn.WidgetBox(
        '# Iris K-Means Clustering',
        pn.Column(
            "This app provides an example of **building a simple dashboard using Panel**.\\n\\nIt demonstrates how to take the output of **k-means clustering on the Iris dataset** using scikit-learn, parameterizing the number of clusters and the variables to plot.\\n\\nThe entire clustering and plotting pipeline is expressed as a **single reactive function** that responsively returns an updated plot when one of the widgets changes.\\n\\n The **\`x\` marks the center** of the cluster.""",
            x, y, n_clusters
        ).servable(target='sidebar')
    ),
    pn.pane.HoloViews(
        pn.bind(get_clusters, x, y, n_clusters), sizing_mode='stretch_width'
    ).servable(title='Iris K-Means Clustering')
)



await write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    state.curdoc.apply_json_patch(patch.to_py(), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()