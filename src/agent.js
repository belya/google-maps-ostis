GoogleMaps.Agent = function(question, args) {
  this.setQuestion(question);
  this.setArguments(args);
};

GoogleMaps.Agent.prototype.setQuestion = function(question) {
  this.question = question;
};

GoogleMaps.Agent.prototype.setArguments = function(args) {
  this.args = args;
};

GoogleMaps.Agent.prototype.run = function() {
  var self = this;
  var deferred = $.Deferred();
  this.createAgentNode().promise()
    .done(function(node) {
      self.agentNode = node;
      self.createAgentNodeSurrounding()
        .done(function() {
          self.startAgent().promise()
            .done(function() {
              self.waitForAnswer()
                .done(deferred.resolve)
            });
        });
    });
  return deferred;
};

GoogleMaps.Agent.prototype.createAgentNode = function() {
  return window.sctpClient.create_node(sc_type_const | sc_type_node);
};

GoogleMaps.Agent.prototype.createAgentNodeSurrounding = function() {
  var self = this;
  var deferred = $.Deferred();
  this.addToQuestionSet()
    .done(function() {
      self.addToSpecifiedQuestionSet()
        .done(function() {
          self.createArgs()
            .done(deferred.resolve);
        });
    })
  return deferred;
};

GoogleMaps.Agent.prototype.addToQuestionSet = function() {
  return window.sctpClient.create_arc(
    sc_type_arc_pos_const_perm, 
    GoogleMaps.keynodes.get('question'), 
    this.agentNode
  );
};

GoogleMaps.Agent.prototype.addToSpecifiedQuestionSet = function() {
  return window.sctpClient.create_arc(
    sc_type_arc_pos_const_perm, 
    GoogleMaps.keynodes.get(this.question), 
    this.agentNode
  );
};

GoogleMaps.Agent.prototype.createArgs = function() {
  var self = this;
  var deferreds = [];
  for(var i = 0; i < this.args.length; i++)
    deferreds.push($.Deferred());
  $(this.args).each(function(index, argument) {
    var rrel = GoogleMaps.keynodes.get("rrel_" + (index + 1));
    window.sctpClient.create_arc(
      sc_type_arc_pos_const_perm, 
      self.agentNode, 
      argument
    ).done(function(arc) {
      window.sctpClient.create_arc(
        sc_type_arc_pos_const_perm, 
        rrel, 
        arc
      )
        .done(deferreds[index].resolve)
        .fail(function() {
          console.log(arguments);
        })
    });
  });
  return $.when.apply($, deferreds);
};

GoogleMaps.Agent.prototype.startAgent = function() {
  return window.sctpClient.create_arc(
    sc_type_arc_pos_const_perm, 
    GoogleMaps.keynodes.get('question_initiated'), 
    this.agentNode
  );
};

GoogleMaps.Agent.prototype.waitForAnswer = function() {
  var deferred = $.Deferred();
  var process = setTimeout(function() {
    // window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_F, [
    //   GoogleMaps.keynodes.get('question_finished'),
    //   sc_type_arc_pos_const_perm,
    //   this.agentNode
    // ])
    //   .done(function() {
    //     clearTimeout(process);
    //     deferred.resolve();
    //   })
    deferred.resolve();
  }, 5000);
  return deferred;
};