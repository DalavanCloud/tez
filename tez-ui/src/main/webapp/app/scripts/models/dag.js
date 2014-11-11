/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

App.Dag = App.AbstractEntity.extend({

  submittedTime: DS.attr('number'),
  
  // start time of the entity
  startTime: DS.attr('number'),

  // end time of the entity
  endTime: DS.attr('number'),

	// set type to DAG
	entityType: App.EntityType.DAG,

	// Name of the dag.
	name: DS.attr('string'),

	// user name who ran this dag.
	user: DS.attr('string'),

	// application ID of this dag.
	applicationId: DS.attr('string'),

	// status
	status: DS.attr('string'),

	// diagnostics info if any.
	diagnostics: DS.attr('string'),

	//vertices: DS.hasMany('vertex'),

	//edges: DS.hasMany('edge'),

  counterGroups: DS.hasMany('counterGroup', { inverse: 'parent' })
});

App.CounterGroup = DS.Model.extend({
  name: DS.attr('string'),

  displayName: DS.attr('string'),

  counters: DS.hasMany('counter', { inverse: 'parent' }),

  parent: DS.belongsTo('abstractEntity', { polymorphic: true })
});

App.Counter = DS.Model.extend({
  name: DS.attr('string'),

  displayName: DS.attr('string'),

  value: DS.attr('number'),

  parent: DS.belongsTo('counterGroup')
});

App.Edge = DS.Model.extend({

  fromVertex: DS.belongsTo('vertex'),

  toVertex: DS.belongsTo('vertex'),

  /**
   * Type of this edge connecting vertices. Should be one of constants defined
   * in 'App.EdgeType'.
   */
  edgeType: DS.attr('string'),

  dag: DS.belongsTo('dag')
});

App.Vertex = DS.Model.extend({
  name: DS.attr('string'),

  dag: DS.belongsTo('dag'),
  dagID: DS.attr('string'),

  /**
   * State of this vertex. Should be one of constants defined in
   * App.VertexState.
   */
  status: DS.attr('string'),

  /**
   * Vertex type has to be one of the types defined in 'App.VertexType'
   * @return {string}
   */
  type: DS.attr('string'),

  /**
   * A vertex can have multiple incoming edges.
   */
  incomingEdges: DS.hasMany('edge', {inverse: 'fromVertex' }),

  /**
   * This vertex can have multiple outgoing edges.
   */
  outgoingEdges: DS.hasMany('edge', {inverse: 'toVertex'}),

  startTime: DS.attr('number'),

  endTime: DS.attr('number'),

  /**
   * Provides the duration of this job. If the job has not started, duration
   * will be given as 0. If the job has not ended, duration will be till now.
   *
   * @return {Number} Duration in milliseconds.
   */
  duration: function () {
    return App.Helpers.date.duration(this.get('startTime'), this.get('endTime'))
  }.property('startTime', 'endTime'),

  /**
   * Each Tez vertex can perform arbitrary application specific computations
   * inside. The application can provide a list of operations it has provided in
   * this vertex.
   *
   * Array of strings. [{string}]
   */
  operations: DS.attr('array'),

  /**
   * Provides additional information about the 'operations' performed in this
   * vertex. This is shown directly to the user.
   */
  operationPlan: DS.attr('string'),

  /**
   * Number of actual Map/Reduce tasks in this vertex
   */
  numTasks: DS.attr('number'),

  name: DS.attr('string'),

  failedTasks: DS.attr('number'),
  sucessfulTasks: DS.attr('number'),
  numTasks: DS.attr('number'),
  killedTasks: DS.attr('number'),

  diagnostics: DS.attr('string'),

  counterGroups: DS.hasMany('counterGroup'),

  tasksNumber: function () {
    return this.getWithDefault('tasksCount', 0);
  }.property('tasksCount'),

  /**
   * Local filesystem usage metrics for this vertex
   */
  fileReadBytes: DS.attr('number'),

  fileWriteBytes: DS.attr('number'),

  fileReadOps: DS.attr('number'),

  fileWriteOps: DS.attr('number'),

  /**
   * Spilled records
   */
  spilledRecords: DS.attr('number'),

  /**
   * HDFS usage metrics for this vertex
   */
  hdfsReadBytes: DS.attr('number'),

  hdfsWriteBytes: DS.attr('number'),

  hdfsReadOps: DS.attr('number'),

  hdfsWriteOps: DS.attr('number'),

  /**
   * Record metrics for this vertex
   */
  recordReadCount: DS.attr('number'),

  recordWriteCount: DS.attr('number'),

  totalReadBytes: function () {
    return this.get('fileReadBytes') + this.get('hdfsReadBytes');
  }.property('fileReadBytes', 'hdfsReadBytes'),

  totalWriteBytes: function () {
    return this.get('fileWriteBytes') + this.get('hdfsWriteBytes');
  }.property('fileWriteBytes', 'hdfsWriteBytes'),

  totalReadBytesDisplay: function () {
    return  App.Helpers.number.bytesToSize(this.get('totalReadBytes'));
  }.property('totalReadBytes'),

  totalWriteBytesDisplay: function () {
    return  App.Helpers.number.bytesToSize(this.get('totalWriteBytes'));
  }.property('totalWriteBytes'),

  durationDisplay: function () {
    return App.Helpers.date.timingFormat(this.get('duration'), true);
  }.property('duration')
});

App.AppDetail = DS.Model.extend({
  attemptId: DS.attr('string'),

  user: DS.attr('string'),
  name: DS.attr('string'),
  queue: DS.attr('string'),
  type: DS.attr('string'),

  appState: DS.attr('string'),
  finalAppStatus: DS.attr('string'),
  progress: DS.attr('string'),

  startedTime: DS.attr('number'),
  elapsedTime: DS.attr('number'),
  finishedTime: DS.attr('number'),
  submittedTime: DS.attr('number'),

  diagnostics: DS.attr('string'),
});

App.TezApp = DS.Model.extend({
  appId: DS.attr('string'),
  entityType: DS.attr('string'),
  domain: DS.attr('string'),

  startedTime: DS.attr('number'),

  appDetail: DS.belongsTo('appDetail', { async: true }),
  dags: DS.hasMany('dag', { async: true }),

  configs: DS.hasMany('kVData', { async: false })
});


App.Task = App.AbstractEntity.extend({
  status: DS.attr('status'),

  dagID: DS.attr('string'),
  
  vertexID: DS.attr('string'),

  startTime: DS.attr('number'),

  endTime: DS.attr('number'),

  diagnostics: DS.attr('string'),

  numAttempts: DS.attr('number'),

  counterGroups: DS.hasMany('counterGroup', { inverse: 'parent' })
});

App.KVDatum = DS.Model.extend({
  key: DS.attr('string'),
  value: DS.attr('string'),
});

App.VertexState = {
  NEW: "NEW",
  INITIALIZING: "INITIALIZING",
  INITED: "INITED",
  RUNNING: "RUNNING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  KILLED: "KILLED",
  ERROR: "ERROR",
  TERMINATING: "TERMINATING",
  JOBFAILED: "JOB FAILED"
};

App.VertexType = {
  MAP: 'MAP',
  REDUCE: 'REDUCE',
  UNION: 'UNION'
};

App.EdgeType = {
  SCATTER_GATHER: "SCATTER_GATHER",
  BROADCAST: "BROADCAST",
  CONTAINS: "CONTAINS"
};