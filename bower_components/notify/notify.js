;(function (window) {

	var proto_methods = {
			options: {
				wrapper: document.body,
				dismissIn: 5000
			},
			init: function () {
				this.ntf = document.createElement('div');
				this.ntf.className = 'notify';
				var strinner = '<div class="notify-inner"></div><div class="notify-close">x</div></div>';
				this.ntf.innerHTML = strinner;

				// append to body or the element specified in options.wrapper
				this.options.wrapper.insertBefore(this.ntf, this.options.wrapper.lastChild);

				// init events
				this.initEvents();
			},
			initEvents: function () {
				var self = this;
				// dismiss 
				this.ntf.querySelector('.notify-close').addEventListener('click', function () {
					self.dismiss();
				});
			},
			dismiss: function () {
				var self = this;
				clearTimeout(this.dismissttl);

				classie.remove(self.ntf, 'notify-show');
				setTimeout(function () {
					classie.add(self.ntf, 'notify-hide');
				}, 25);

				setTimeout(function () {
					self.options.wrapper.removeChild(self.ntf);
				}, 500);

			},
			setType: function (newType) {
				var self = this;

				classie.remove(self.ntf, 'notify-error');
				classie.remove(self.ntf, 'notify-alert');
				classie.remove(self.ntf, 'notify-success');

				classie.add(self.ntf, newType);

			},
			success: function (message, dismissIn) {
				var self = this;

				/**
				 * Use supplied dismiss timeout if present, else uses default value.
				 * If set to 0, doesnt automatically dismiss.
				 */
				dismissIn = (typeof dismissIn === 'undefined') ? this.options.dismissIn : dismissIn;

				/**
				 * Set  type styling
				 */
				self.setType('notify-success');

				self.ntf.querySelector('.notify-inner').innerHTML = message;

				classie.remove(self.ntf, 'notify-hide');
				classie.add(self.ntf, 'notify-show');

				if (dismissIn > 0) {
					this.dismissttl = setTimeout(function () {
						self.dismiss();
					}, dismissIn);
				}
			},
			error: function (message, dismissIn) {
				var self = this;

				/**
				 * Use supplied dismiss timeout if present, else uses default value.
				 * If set to 0, doesnt automatically dismiss.
				 */
				dismissIn = (typeof dismissIn === 'undefined') ? this.options.dismissIn : dismissIn;

				/**
				 * Set  type styling
				 */
				self.setType('notify-error');

				self.ntf.querySelector('.notify-inner').innerHTML = message;

				classie.remove(self.ntf, 'notify-hide');
				classie.add(self.ntf, 'notify-show');

				if (dismissIn > 0) {
					this.dismissttl = setTimeout(function () {
						self.dismiss();
					}, dismissIn);
				}
			},
			alert: function (message, dismissIn) {
				var self = this;

				/**
				 * Use supplied dismiss timeout if present, else uses default value.
				 * If set to 0, doesnt automatically dismiss.
				 */
				dismissIn = (typeof dismissIn === 'undefined') ? this.options.dismissIn : dismissIn;

				/**
				 * Set  type styling
				 */
				self.setType('notify-alert');

				self.ntf.querySelector('.notify-inner').innerHTML = message;

				classie.remove(self.ntf, 'notify-hide');
				classie.add(self.ntf, 'notify-show');

				if (dismissIn > 0) {
					this.dismissttl = setTimeout(function () {
						self.dismiss();
					}, dismissIn);
				}
			}
		},
		notify, Notify;

	Notify = function () {
		this.init();
	};

	Notify.prototype = proto_methods;

	notify = function () {
		return new Notify();
	};

	/**
	 * add to global namespace
	 */
	window.notify = notify;

})(window);
