/**
 *	flagger.js - BackBone View for Flagger's main settings UI
 *
 *	This file is part of Flagger, which is licensed under version 3 of the GNU
 *	General Public License as published by the Free Software Foundation.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program; if not, see <http://www.gnu.org/licenses/>.
 */
var FlaggerView = Backbone.View.extend({

	tagName:  "div",

	events:
	{
		'keyup #entry': 'handle_entry',
		'change #entry': 'handle_entry',
		'click #clear_entry': 'clear_entry',
		'click #select_all': 'select_all',
		'click #select_none': 'select_none',
		'change #message': 'save_message',

		// promo related
		'click a.never_again': 'dismiss_promo'
	},

	initialize: function()
	{
		this.render();

		this.listenTo(this.options.flags_collection, 'add', this.render_flags);
		this.listenTo(this.options.flags_collection, 'toggle', this.save_list);

		window.onblur = function() {
			$('#message').trigger('change');
		}.bind(this);
	},

	render: function()
	{
		flagger.templating.render('flagger', {message: SETTINGS.user_message}, function(html) {

			this.$el.html(html);
			$("#view").html(this.$el);
			$('html,body').animate({scrollTop: 0}, 500);

			this.render_flags();

			if (this.options.flags_collection.are_all_active())
			{
				$('#select_none').css('display', 'inline');
				$('#select_all').css('display', 'none');
			}

			// promo related
			this.handle_promo_display_logic();

		}.bind(this));
		
		return this;
	},

	render_flags: function()
	{
		var _flags = this.options.flags_collection;

		_flags.each(function(flag) {

			if (!$("#flag_" + flag.id).length)
			{
				var view = new FlagView({model: flag});

				view.render(function(rendered_view) {

					this.$("ul#flags").prepend(rendered_view.el);

				}.bind(this));				
			}

			return this;
		});
	},

	handle_entry: function(e)
	{
		var entry = $('#entry').val();

		this.options.flags_collection.filter_list(entry);

		if (typeof e.keyCode != "undefined")
		{
			switch (e.keyCode)
			{
				case 13:
					this.options.flags_collection.add_list([entry], true);
					this.save_list();
					return this.clear_entry();
					break;
				case 27:
					return this.clear_entry()
			}
		}

		if (entry)
			$('#clear_entry').css('display', 'inline-block');
		else
			$('#clear_entry').css('display', 'none');
	},

	clear_entry: function(e)
	{
		if (e) e.preventDefault();

		$('#entry').val('').trigger('change');
		$('#clear_entry').css('display', 'none');
	},

	select_all: function(e)
	{
		e.preventDefault();

		this.options.flags_collection.set_is_active(true);
		this.save_list();

		$('#select_none').css('display', 'inline');
		$('#select_all').css('display', 'none');
	},

	select_none: function(e)
	{
		e.preventDefault();

		this.options.flags_collection.set_is_active(false);
		this.save_list();		

		$('#select_none').css('display', 'none');
		$('#select_all').css('display', 'inline');
	},

	save_list: function(e)
	{
		addon_io.call('set_setting', {setting: 'user_flags', val: this.options.flags_collection.render_list()}, function(data) {
			console.log('saved list');
		});
	},

	save_message: function(e)
	{
		addon_io.call('set_setting', {setting: 'user_message', val: escape($('#message').val())}, function(data) {
			console.log('saved message');
		});
	},

	// promo related
	handle_promo_display_logic: function()
	{
		SETTINGS.promo_1_hits++;
		addon_io.call('set_setting', {setting: 'promo_1_hits', val: SETTINGS.promo_1_hits}, function(data) {});

		if (SETTINGS.promo_1_hits >= 3 && !SETTINGS.promo_1_dismissed)
			$('.promo').slideDown();
		
	},

	// promo related
	dismiss_promo: function(e)
	{
		e.preventDefault();
		SETTINGS.promo_1_dismissed = true;
		addon_io.call('set_setting', {setting: 'promo_1_dismissed', val: SETTINGS.promo_1_dismissed}, function(data) {});
		$('.promo').slideUp();
	}
});