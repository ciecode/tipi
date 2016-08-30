Template.profileEdit.helpers({
    userSchema: function() {
        return Schema.User;
    },
    otherDicts: function() {
        myDicts = Meteor.users.findOne({}, {fields: {'profile.dicts': 1}});
        allTipiDicts = Dicts.find({}, {fields: {dict: 1}}).fetch();
        dicts = [];
        _.each(allTipiDicts, function(d) {
            dicts.push(d.dict);
        });
        return _.difference(dicts, myDicts.profile.dicts);
    }
});

Template.profileEdit.events = {
    'click .btn-add-dict': function(e) {
        Meteor.call('addDictToUser', $(e.target).attr('user'), $(e.target).attr('dict'));
    },
    'click .btn-remove-dict': function(e) {
        Meteor.call('removeDictToUser', $(e.target).attr('user'), $(e.target).attr('dict'));
    }
};
