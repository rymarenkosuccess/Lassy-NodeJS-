$(function(){
	var Contact = Backbone.Model.extend({
		defaults: function()
		{
			return {
				name:"",
				mobile:"",
			}
		},
		urlRoot: '/lassy/'+window.lid+'/notifiers' ,
		idAttribute: '_id'
	});

	var ContactList = Backbone.Collection.extend({
		model: Contact,
		parse: function(response) {
			if(response.success)
			{
				return response.contacts;
			}else{
				return [];
			}
    		
  		},
		url: '/lassy/'+window.lid+'/notifiers'
	});

	var Contacts = new ContactList;

	var ContactView = Backbone.View.extend({
		tagName: "li",

		template: _.template($('#contact-item-tpl').html()),

		events: {
			"click .save-contact" : "addContact",
			"click .editContact" : "editContact",
			"click .delContact"  : "deleteContact"
		},

		initialize: function()
		{
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
			this.mobileRegex  = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
		},

		render: function()
		{
			var c = this.template(this.model.toJSON());
			this.$el.html('')
			this.$el.html(c);			
			this.$('input[name="contactnum"]').mask("999-999-9999");

			if(this.model.isNew())
			{
				this.$el.removeClass('display').addClass('edit')
			}else{
				this.$el.removeClass('edit').addClass('display')
			}
			return this;
		},

		edit: function()
		{
			this.$el.addClass("editing");
			this.input.focus();
		},

		addContact: function(e)
		{
			e.preventDefault();
			var name = this.$('input[name="contactname"]').val(),
				mobile = this.$('input[name="contactnum"]').val();

			
			if (this.mobileRegex.test(mobile) && (name != "")) {
			    this.model.save({name:name, mobile:mobile}, {success:function(m, resp){
			    	console.log(resp);
			    }})
			} else {
			    // Invalid phone number
			    alert('Please Enter a valid phone number')
			}
		},

		editContact: function(e)
		{
			e.preventDefault();
			this.$el.removeClass('display').addClass('edit');
		},

		deleteContact: function(e)
		{
			var self = this;
			e.preventDefault();
			this.model.destroy({
				success:function(){
					self.$el.remove();
				},
				error: function(){
					alert('Failed in deleting object')
				},
				wait: true,
			})
		}
	})

	var ContactApp = Backbone.View.extend({
		el:$("#contacts-app"),

		events: {
			'click .new-contact':'addNewContact'
		},

		initialize: function()
		{
			var self = this;
			Contacts.fetch({success:function(coll, response, options){
											
			}});
			this.mobileRegex  = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
			this.$('input[name="mobile"]').mask("999-999-9999");
			this.listenTo(Contacts, 'add', this.addOne);
		},

		addNewContact: function(e)
		{
			e.preventDefault();
			var $name = this.$('input[name="name"]'),
				$mobile = this.$('input[name="mobile"]');

			
			if (this.mobileRegex.test($mobile.val()) && ($name.val() != "")) {
				var n = new Contact()
			    n.save({name:$name.val(), mobile:$mobile.val()}, {success:function(m, resp){			    	
			    	Contacts.add(n);
			    	$name.val('');
			    	$mobile.val('');
			    }})
			} else {
			    // Invalid phone number
			    alert('Please Enter a valid phone number')
			}
		},


		addOne: function(contact)
		{
			var cView = new ContactView({model:contact});
			$('.contact-list').append(cView.render().el);
		}
	});

	var app = new ContactApp;
});