// Adapted from Allen98637/GalaxyMod source/modcharts (Apache-2.0).
// Haxe to JavaScript adaptation; window operations use a virtual in-canvas window.
const GALAXY_NATIVE={};
GALAXY_NATIVE['cona']=function(env){const {Conductor,FlxG,FlxMath,PlayState,PlayMoving,PlayWindow,Lib,Note,NoteObject,Std,RenderPath,FixedScaleMode,RatioScaleMode}=env;let count=0;function pos(daNote, strumLine){
		if (daNote.strumTime >= 15000 && daNote.strumTime < 21562)
		{
			if (Conductor.songPosition < 15000)
			{
				if (FlxG.save.data.downscroll)
					daNote.y = (strumLine.y
						+ (15000 - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)))
						+ (Conductor.songPosition - 15000) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2));
				else
					daNote.y = (strumLine.y
						- (15000 - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)))
						- (Conductor.songPosition - 15000) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2));
			}
			else
			{
				if (FlxG.save.data.downscroll)
					daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
				else
					daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
			}
			if (daNote.isSustainNote && daNote.animation.curAnim.name.endsWith('hold'))
			{
				daNote.scale.y = 0.7 * Conductor.stepCrochet / 100 * 1.5 * PlayState.SONG.speed / 1.5;
				daNote.updateHitbox();
			}
		}
		else if (daNote.strumTime >= 22500 && daNote.strumTime < 26016)
		{
			if (Conductor.songPosition < 22500)
			{
				if (FlxG.save.data.downscroll)
					daNote.y = (strumLine.y
						+ (22500 - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)))
						+ (Conductor.songPosition - 22500) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2));
				else
					daNote.y = (strumLine.y
						- (22500 - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)))
						- (Conductor.songPosition - 22500) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2));
			}
			else
			{
				if (FlxG.save.data.downscroll)
					daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
				else
					daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
			}
			if (daNote.isSustainNote && daNote.animation.curAnim.name.endsWith('hold'))
			{
				daNote.scale.y = 0.7 * Conductor.stepCrochet / 100 * 1.5 * PlayState.SONG.speed / 1.5;
				daNote.updateHitbox();
			}
		}
		else if ((daNote.strumTime >= 45000 && daNote.strumTime < 59766)
			|| (daNote.strumTime >= 45000 && daNote.strumTime < 65625.0 && daNote.mustPress))
		{
			if (FlxG.save.data.downscroll)
				daNote.y = (PlayMoving.ylist[daNote.noteData]
					+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (PlayMoving.ylist[daNote.noteData]
					- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
		else if (daNote.strumTime >= 60000 && daNote.strumTime < 74766)
		{
			if (!daNote.mustPress)
			{
				switch (daNote.noteData)
				{
					case 0:
						daNote.x = (218 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
						daNote.y = 300;
						if (daNote.x > 500)
							daNote.alpha = (550 - daNote.x) / 50;
						else
							daNote.alpha = 1;
					break;
case 1:
						daNote.x = 218;
						daNote.y = (300 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					break;
case 2:
						daNote.x = 218;
						daNote.y = (300 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					break;
case 3:
						daNote.x = (218 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
						daNote.y = 300;
						if (daNote.x > 500)
							daNote.alpha = (550 - daNote.x) / 50;
						else
							daNote.alpha = 1;
				break;
}
			}
			else
			{
				switch (daNote.noteData)
				{
					case 0:
						daNote.x = (858 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
						daNote.y = 300;
						if (daNote.x < 570)
							daNote.alpha = (daNote.x - 520) / 50;
						else
							daNote.alpha = 1;
					break;
case 1:
						daNote.x = 858;
						daNote.y = (300 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					break;
case 2:
						daNote.x = 858;
						daNote.y = (300 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					break;
case 3:
						daNote.x = (858 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
						daNote.y = 300;
						if (daNote.x < 570)
							daNote.alpha = (daNote.x - 520) / 50;
						else
							daNote.alpha = 1;
				break;
}
			}
		}
		else if (daNote.strumTime >= 90000 && daNote.strumTime < 120000)
		{
			if (FlxG.save.data.downscroll)
			{
				if ((Std.int((daNote.strumTime - 90000) / 7500) % 2 == 0 && daNote.mustPress)
					|| Std.int((daNote.strumTime - 90000) / 7500) % 2 == 1
					&& !daNote.mustPress)
				{
					if (daNote.mustPress)
						daNote.y = (PlayMoving.ylist[0]
							+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					else
						daNote.y = (PlayMoving.ylist[1]
							+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				}
				else
				{
					if (daNote.mustPress)
						daNote.y = (PlayMoving.ylist[0]
							- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					else
						daNote.y = (PlayMoving.ylist[1]
							- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				}
			}
			else
			{
				if ((Std.int((daNote.strumTime - 90000) / 7500) % 2 == 0 && daNote.mustPress)
					|| Std.int((daNote.strumTime - 90000) / 7500) % 2 == 1
					&& !daNote.mustPress)
				{
					if (daNote.mustPress)
						daNote.y = (PlayMoving.ylist[0]
							- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					else
						daNote.y = (PlayMoving.ylist[1]
							- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				}
				else
				{
					if (daNote.mustPress)
						daNote.y = (PlayMoving.ylist[0]
							+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					else
						daNote.y = (PlayMoving.ylist[1]
							+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				}
			}
		}
		else if (daNote.strumTime >= 120000)
		{
			if (daNote.mustPress)
			{
				daNote.x = PlayMoving.pxlist[daNote.noteData];
				if (FlxG.save.data.downscroll)
					daNote.y = (PlayMoving.ylist[0] + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				else
					daNote.y = (PlayMoving.ylist[0] - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				if (daNote.isSustainNote)
					daNote.x += daNote.width;
			}
			else
			{
				daNote.x = PlayMoving.xlist[daNote.noteData];
				if (FlxG.save.data.downscroll)
					daNote.y = (PlayMoving.ylist[1] - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				else
					daNote.y = (PlayMoving.ylist[1] + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				if (daNote.isSustainNote)
					daNote.x += daNote.width;
			}
		}
		else
		{
			if (FlxG.save.data.downscroll)
				daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
	}
function spos(dastrum, strumLine){
		if (Conductor.songPosition >= 30000 && Conductor.songPosition < 45000)
		{
			if (FlxG.save.data.downscroll)
			{
				if (Std.int((Conductor.songPosition - 30000) / 937.5) % 2 == 0)
					dastrum.y = 550 - ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
				else
					dastrum.y = 350 + ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
			}
			else
			{
				if (Std.int((Conductor.songPosition - 30000) / 937.5) % 2 == 0)
					dastrum.y = 50 + ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
				else
					dastrum.y = 250 - ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
			}
			strumLine.y = dastrum.y;
		}
		else if (Conductor.songPosition >= 45000 && Conductor.songPosition < 59531.25)
		{
			switch (Std.int((Conductor.songPosition - 30000) / 937.5) % 4)
			{
				case 0:
					if (dastrum.ID % 2 == 0)
					{
						if (FlxG.save.data.downscroll)
							dastrum.y = 550 - ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
						else
							dastrum.y = 50 + ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
					}
				break;
case 1:
					if (dastrum.ID % 2 == 0)
					{
						if (FlxG.save.data.downscroll)
							dastrum.y = 350 + ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
						else
							dastrum.y = 250 - ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
					}
				break;
case 2:
					if (dastrum.ID % 2 == 1)
					{
						if (FlxG.save.data.downscroll)
							dastrum.y = 550 - ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
						else
							dastrum.y = 50 + ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
					}
				break;
case 3:
					if (dastrum.ID % 2 == 1)
					{
						if (FlxG.save.data.downscroll)
							dastrum.y = 350 + ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
						else
							dastrum.y = 250 - ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
					}
			break;
}
			PlayMoving.ylist[dastrum.ID] = dastrum.y;
		}
		else if (Conductor.songPosition >= 59531.25 && Conductor.songPosition < 73125)
		{
			if (Conductor.songPosition < 60000.0)
			{
				if (dastrum.x > 640)
				{
					if (dastrum.ID % 2 == 1)
					{
						if (FlxG.save.data.downscroll)
							dastrum.y = 350 + ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
						else
							dastrum.y = 250 - ((Conductor.songPosition - 30000) % 937.5) / 937.5 * 200;
					}
					PlayMoving.ylist[dastrum.ID] = dastrum.y;
				}
				else
				{
					dastrum.x = PlayMoving.oxlist[dastrum.ID] - (Conductor.songPosition - 59531.25) / 468.75 * (PlayMoving.oxlist[dastrum.ID] - 218);
					if (FlxG.save.data.downscroll)
						dastrum.y = 550 - (Conductor.songPosition - 59531.25) / 468.75 * 250;
					else
						dastrum.y = 50 + (Conductor.songPosition - 59531.25) / 468.75 * 250;
				}
			}
			else if (Conductor.songPosition >= 63750.0 && Conductor.songPosition < 64218.75)
			{
				if (dastrum.x > 640)
				{
					dastrum.x = PlayMoving.poxlist[dastrum.ID] - (Conductor.songPosition - 63750.0) / 468.75 * (PlayMoving.poxlist[dastrum.ID] - 858);
					if (FlxG.save.data.downscroll)
						dastrum.y = 550 - (Conductor.songPosition - 63750.0) / 468.75 * 250;
					else
						dastrum.y = 50 + (Conductor.songPosition - 63750.0) / 468.75 * 250;
				}
			}
		}
		else if (Conductor.songPosition >= 74531.25 && Conductor.songPosition < 75468.75)
		{
			if (Conductor.songPosition < 75000.0)
			{
				if (dastrum.x < 640)
				{
					dastrum.x = 218 - (Conductor.songPosition - 74531.25) / 468.75 * (218 - PlayMoving.oxlist[dastrum.ID]);
					if (FlxG.save.data.downscroll)
						dastrum.y = 300 + (Conductor.songPosition - 74531.25) / 468.75 * 250;
					else
						dastrum.y = 300 - (Conductor.songPosition - 74531.25) / 468.75 * 250;
				}
			}
			else if (Conductor.songPosition >= 75000.0 && Conductor.songPosition < 75468.75)
			{
				if (dastrum.x > 640)
				{
					dastrum.x = 858 + (Conductor.songPosition - 75000.0) / 468.75 * (PlayMoving.poxlist[dastrum.ID] - 858);
					if (FlxG.save.data.downscroll)
						dastrum.y = 300 + (Conductor.songPosition - 75000.0) / 468.75 * 250;
					else
						dastrum.y = 300 - (Conductor.songPosition - 75000.0) / 468.75 * 250;
				}
			}
		}
		else if (Conductor.songPosition >= 89531.25 && Conductor.songPosition < 90000)
		{
			if (dastrum.x < 640)
			{
				if (FlxG.save.data.downscroll)
					dastrum.y = 550 - (Conductor.songPosition - 89531.25) / 468.75 * 500;
				else
					dastrum.y = 50 + (Conductor.songPosition - 89531.25) / 468.75 * 500;
			}
		}
		else if (Conductor.songPosition >= 90000 && Conductor.songPosition < 120000)
		{
			if (FlxG.save.data.downscroll)
			{
				if ((Std.int((Conductor.songPosition - 90000) / 7500) % 2 == 0 && dastrum.x > 640)
					|| Std.int((Conductor.songPosition - 90000) / 7500) % 2 == 1
					&& dastrum.x < 640)
				{
					if (Std.int((Conductor.songPosition - 90000) / 937.5) % 8 > 5)
						dastrum.y = 550 - ((Conductor.songPosition - 90000) % 1875) / 1875 * 500;
					else if (Std.int((Conductor.songPosition - 90000) / 937.5) % 2 == 0)
						dastrum.y = 550 - ((Conductor.songPosition - 90000) % 937.5) / 937.5 * 200;
					else
						dastrum.y = 350 + ((Conductor.songPosition - 90000) % 937.5) / 937.5 * 200;
				}
				else
				{
					if (Std.int((Conductor.songPosition - 90000) / 937.5) % 8 > 5)
						dastrum.y = 50 + ((Conductor.songPosition - 90000) % 1875) / 1875 * 500;
					else if (Std.int((Conductor.songPosition - 90000) / 937.5) % 2 == 0)
						dastrum.y = 50 + ((Conductor.songPosition - 90000) % 937.5) / 937.5 * 200;
					else
						dastrum.y = 250 - ((Conductor.songPosition - 90000) % 937.5) / 937.5 * 200;
				}
			}
			else
			{
				if ((Std.int((Conductor.songPosition - 90000) / 7500) % 2 == 0 && dastrum.x > 640)
					|| Std.int((Conductor.songPosition - 90000) / 7500) % 2 == 1
					&& dastrum.x < 640)
				{
					if (Std.int((Conductor.songPosition - 90000) / 937.5) % 8 > 5)
						dastrum.y = 50 + ((Conductor.songPosition - 90000) % 1875) / 1875 * 500;
					else if (Std.int((Conductor.songPosition - 90000) / 937.5) % 2 == 0)
						dastrum.y = 50 + ((Conductor.songPosition - 90000) % 937.5) / 937.5 * 200;
					else
						dastrum.y = 250 - ((Conductor.songPosition - 90000) % 937.5) / 937.5 * 200;
				}
				else
				{
					if (Std.int((Conductor.songPosition - 90000) / 937.5) % 8 > 5)
						dastrum.y = 550 - ((Conductor.songPosition - 90000) % 1875) / 1875 * 500;
					else if (Std.int((Conductor.songPosition - 90000) / 937.5) % 2 == 0)
						dastrum.y = 550 - ((Conductor.songPosition - 90000) % 937.5) / 937.5 * 200;
					else
						dastrum.y = 350 + ((Conductor.songPosition - 90000) % 937.5) / 937.5 * 200;
				}
			}
			if (dastrum.x < 640)
				PlayMoving.ylist[1] = dastrum.y;
			else
				PlayMoving.ylist[0] = dastrum.y;
		}
		else if (Conductor.songPosition >= 120000 && Conductor.songPosition < 120937.5)
		{
			if (dastrum.x > 472 + dastrum.ID * 112)
			{
				dastrum.x = PlayMoving.poxlist[dastrum.ID]
					+ ((Conductor.songPosition - 120000) % 937.5) / 937.5 * (472 + dastrum.ID * 112 - PlayMoving.poxlist[dastrum.ID]);
				if (FlxG.save.data.downscroll)
					dastrum.y = 550 - ((Conductor.songPosition - 120000) % 937.5) / 937.5 * 250;
				else
					dastrum.y = 50 + ((Conductor.songPosition - 120000) % 937.5) / 937.5 * 250;
				PlayMoving.ylist[0] = dastrum.y;
				PlayMoving.pxlist[dastrum.ID] = dastrum.x;
			}
			else
			{
				dastrum.x = PlayMoving.oxlist[dastrum.ID]
					+ ((Conductor.songPosition - 120000) % 937.5) / 937.5 * (472 + dastrum.ID * 112 - PlayMoving.oxlist[dastrum.ID]);
				if (FlxG.save.data.downscroll)
					dastrum.y = 50 + ((Conductor.songPosition - 120000) % 937.5) / 937.5 * 250;
				else
					dastrum.y = 550 - ((Conductor.songPosition - 120000) % 937.5) / 937.5 * 250;
				PlayMoving.ylist[1] = dastrum.y;
				PlayMoving.xlist[dastrum.ID] = dastrum.x;
			}
		}
		else if (Conductor.songPosition >= 120937.5)
		{
			dastrum.x = 472 + dastrum.ID * 112;
			dastrum.y = 300;
			PlayMoving.ylist[0] = dastrum.y;
			PlayMoving.pxlist[dastrum.ID] = dastrum.x;
			PlayMoving.ylist[1] = dastrum.y;
			PlayMoving.xlist[dastrum.ID] = dastrum.x;
		}
	}
function kill(daNote){
		if (daNote.strumTime >= 60000 && daNote.strumTime < 74766)
			return ((daNote.x < -daNote.width)
				|| (daNote.x > FlxG.width)
				|| (daNote.y < -daNote.height)
				|| (daNote.y > FlxG.height)
				|| (daNote.alpha <= 0))
				&& Conductor.songPosition > daNote.strumTime;
		else if (daNote.strumTime >= 90000)
			return ((daNote.y < -daNote.height) || (daNote.y > FlxG.height)) && daNote.tooLate;
		else
		{
			if (FlxG.save.data.downscroll)
				return daNote.y > FlxG.height;
			else
				return daNote.y < -daNote.height;
		}
	}
function ups(daNote, strumLine){
		if (daNote.strumTime >= 90000 && daNote.strumTime < 120000)
		{
			if (FlxG.save.data.downscroll)
			{
				if ((Std.int((daNote.strumTime - 90000) / 7500) % 2 == 0 && daNote.mustPress)
					|| Std.int((daNote.strumTime - 90000) / 7500) % 2 == 1
					&& !daNote.mustPress)
				{
					daNote.angle = 180;
					return 1;
				}
				else
				{
					daNote.angle = 0;
					return 2;
				}
			}
			else
			{
				if ((Std.int((daNote.strumTime - 90000) / 7500) % 2 == 0 && daNote.mustPress)
					|| Std.int((daNote.strumTime - 90000) / 7500) % 2 == 1
					&& !daNote.mustPress)
				{
					daNote.angle = 0;
					return 2;
				}
				else
				{
					daNote.angle = 180;
					return 1;
				}
			}
		}
		else if (daNote.strumTime > 120000)
		{
			if (FlxG.save.data.downscroll)
			{
				if (daNote.mustPress)
				{
					daNote.angle = 180;
					return 1;
				}
				else
				{
					daNote.angle = 0;
					return 2;
				}
			}
			else
			{
				if (daNote.mustPress)
				{
					daNote.angle = 0;
					return 2;
				}
				else
				{
					daNote.angle = 180;
					return 1;
				}
			}
		}
		else
		{
			if (FlxG.save.data.downscroll)
			{
				daNote.angle = 180;
				return 1;
			}
			else
			{
				daNote.angle = 0;
				return 2;
			}
		}
	}
function stry(daNote, strumLine){
		if ((daNote.strumTime >= 45000 && daNote.strumTime < 59766)
			|| (daNote.strumTime >= 45000 && daNote.strumTime < 65625.0 && daNote.mustPress))
			return PlayMoving.ylist[daNote.noteData];
		else if (daNote.strumTime >= 90000)
		{
			if (daNote.mustPress)
				return PlayMoving.ylist[0];
			else
				return PlayMoving.ylist[1];
		}
		else
			return strumLine.y;
	}
return {pos,spos,kill,ups,stry};};
GALAXY_NATIVE['underworld']=function(env){const {Conductor,FlxG,FlxMath,PlayState,PlayMoving,PlayWindow,Lib,Note,NoteObject,Std,RenderPath,FixedScaleMode,RatioScaleMode}=env;let count=0;function pos(daNote, strumLine){
		if (daNote.strumTime < 24114)
		{
			if (FlxG.save.data.downscroll)
			{
				if (Std.int(Conductor.songPosition / 1518.98734177) == Std.int(daNote.strumTime / 1518.98734177))
					daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				else
					daNote.y = (strumLine.y
						+ (Conductor.songPosition - daNote.strumTime - 189.873417722) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			}
			else
			{
				if (Std.int(Conductor.songPosition / 1518.98734177) == Std.int(daNote.strumTime / 1518.98734177))
					daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				else
					daNote.y = (strumLine.y
						- (Conductor.songPosition - daNote.strumTime - 189.873417722) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			}
		}
		else if (daNote.strumTime >= 24303 && daNote.strumTime < 30190)
		{
			if (FlxG.save.data.downscroll)
				daNote.y = (PlayMoving.ylist[daNote.noteData]
					+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (PlayMoving.ylist[daNote.noteData]
					- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
		else if (daNote.strumTime >= 30379 && daNote.strumTime < 36266)
		{
			if (!daNote.isSustainNote)
				daNote.angle += 5;
			if (FlxG.save.data.downscroll)
				daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
		else if (Conductor.songPosition >= 36455.69620253167 && daNote.strumTime < 48418)
		{
			if (daNote.isSustainNote)
			{
				var len = Conductor.stepCrochet;
				if (!daNote.animation.curAnim.name.endsWith('hold'))
				{
					len /= Conductor.stepCrochet / 100 * 1.5 * PlayState.SONG.speed;
				}
				var sdist = -(Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2));
				var edist = -(Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet - len) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed,
					2));
				var x = (daNote.mustPress ? 1110 : 50) + Note.noteWidth[daNote.noteData] * 0.5;
				var y = (daNote.mustPress ? 132 + daNote.noteData * 112 : 468 - daNote.noteData * 112) + Note.noteHeight[daNote.noteData] * 0.5;

				daNote.renderer = new RenderPath(1, [
					sdist,
					edist,
					x,
					y,
					daNote.width * 0.7,
					daNote.mustPress ? 90 : 270,
					Math.abs(x - 640)
				]);
				if (Conductor.songPosition > daNote.strumTime - Conductor.stepCrochet
					&& (!daNote.mustPress || (daNote.wasGoodHit || (daNote.prevNote.wasGoodHit && !daNote.canBeHit))))
					daNote.renderer.bili = 1 - (Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet) / len;
				daNote.pathrender();
			}
			else if (daNote.mustPress)
			{
				daNote.x = (1110 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				daNote.y = 132 + daNote.noteData * 112;
			}
			else
			{
				daNote.x = (50 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				daNote.y = 468 - daNote.noteData * 112;
			}
		}
		else if (daNote.strumTime >= 48607 && daNote.strumTime < 60570)
		{
			if (daNote.isSustainNote)
			{
				var anglist = [-90, 180, 0, 90];
				var len = Conductor.stepCrochet;
				if (!daNote.animation.curAnim.name.endsWith('hold'))
				{
					len /= Conductor.stepCrochet / 100 * 1.5 * PlayState.SONG.speed;
				}
				var sdist = -(Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2));
				var edist = -(Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet - len) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed,
					2));
				var x = 0;
				var y = 0;

				if (daNote.mustPress)
				{
					switch (daNote.noteData)
					{
						case 0:
							y = 300;
							x = 690;
						break;
case 3:
							y = 300;
							x = 1110;
						break;
case 1:
							y = 510;
							x = 900;
						break;
case 2:
							y = 90;
							x = 900;
					break;
}
				}
				else
				{
					switch (daNote.noteData)
					{
						case 0:
							y = 300;
							x = 50;
						break;
case 3:
							y = 300;
							x = 470;
						break;
case 1:
							y = 510;
							x = 260;
						break;
case 2:
							y = 90;
							x = 260;
					break;
}
				}

				daNote.renderer = new RenderPath(1, [
					sdist,
					edist,
					x + Note.noteWidth[daNote.noteData] * 0.5,
					y + Note.noteHeight[daNote.noteData] * 0.5,
					daNote.width * 0.7,
					anglist[daNote.noteData],
					210
				]);
				if (Conductor.songPosition > daNote.strumTime - Conductor.stepCrochet
					&& (!daNote.mustPress || (daNote.wasGoodHit || (daNote.prevNote.wasGoodHit && !daNote.canBeHit))))
					daNote.renderer.bili = 1 - (Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet) / len;
				daNote.pathrender();
			}
			else if (daNote.mustPress)
			{
				switch (daNote.noteData)
				{
					case 0:
						daNote.y = 300;
						daNote.x = (690 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
					break;
case 3:
						daNote.y = 300;
						daNote.x = (1110 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
					break;
case 1:
						daNote.y = (510 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
						daNote.x = 900;
					break;
case 2:
						daNote.y = (90 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
						daNote.x = 900;
				break;
}
			}
			else
			{
				switch (daNote.noteData)
				{
					case 0:
						daNote.y = 300;
						daNote.x = (50 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
					break;
case 3:
						daNote.y = 300;
						daNote.x = (470 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
					break;
case 1:
						daNote.y = (510 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
						daNote.x = 260;
					break;
case 2:
						daNote.y = (90 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed / 1.5, 2)));
						daNote.x = 260;
				break;
}
			}
		}
		else if (daNote.strumTime >= 60759 && daNote.strumTime < 72722)
		{
			if (FlxG.save.data.downscroll)
			{
				if (!daNote.isSustainNote)
				{
					switch (daNote.noteData)
					{
						case 0:
							daNote.angle = -90;
						break;
case 3:
							daNote.angle = 90;
						break;
case 2:
							daNote.angle = 180;
					break;
}
				}
				daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			}
			else
			{
				if (!daNote.isSustainNote)
				{
					switch (daNote.noteData)
					{
						case 0:
							daNote.angle = 90;
						break;
case 3:
							daNote.angle = -90;
						break;
case 1:
							daNote.angle = 180;
					break;
}
				}
				daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			}
		}
		else if (daNote.strumTime >= 78987 && daNote.strumTime < 91045)
		{
			if (FlxG.save.data.downscroll)
			{
				if (daNote.mustPress)
				{
					if ((daNote.strumTime - 85063.29113924058) / 6075.94936709 < 0.5)
						daNote.y = ((550 - 500 * (daNote.strumTime - 85063.29113924058) / 6075.94936709)
							+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					else
						daNote.y = ((550 - 500 * (daNote.strumTime - 85063.29113924058) / 6075.94936709)
							- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				}
				else
				{
					if ((daNote.strumTime - 78987.34177215197) / 6075.94936709 < 0.5)
						daNote.y = ((550 - 500 * (daNote.strumTime - 78987.34177215197) / 6075.94936709)
							+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					else
						daNote.y = ((550 - 500 * (daNote.strumTime - 78987.34177215197) / 6075.94936709)
							- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				}
			}
			else
			{
				if (daNote.mustPress)
				{
					if ((daNote.strumTime - 85063.29113924058) / 6075.94936709 < 0.5)
						daNote.y = ((50 + 500 * (daNote.strumTime - 85063.29113924058) / 6075.94936709)
							- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					else
						daNote.y = ((50 + 500 * (daNote.strumTime - 85063.29113924058) / 6075.94936709)
							+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				}
				else
				{
					if ((daNote.strumTime - 78987.34177215197) / 6075.94936709 < 0.5)
						daNote.y = ((50 + 500 * (daNote.strumTime - 78987.34177215197) / 6075.94936709)
							- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
					else
						daNote.y = ((50 + 500 * (daNote.strumTime - 78987.34177215197) / 6075.94936709)
							+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				}
			}
		}
		else if (daNote.strumTime >= 91139 && daNote.strumTime < 97026)
		{
			if (daNote.mustPress)
				daNote.x = PlayMoving.pxlist[daNote.noteData];
			else
				daNote.x = PlayMoving.xlist[daNote.noteData];
			if (daNote.isSustainNote)
				daNote.x += daNote.width;
			if (FlxG.save.data.downscroll)
				daNote.y = (50 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (550 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
		else if (daNote.strumTime >= 97215 && daNote.strumTime < 109178)
		{
			if (daNote.isSustainNote)
			{
				var len = Conductor.stepCrochet;
				if (!daNote.animation.curAnim.name.endsWith('hold'))
				{
					len /= Conductor.stepCrochet / 100 * 1.5 * PlayState.SONG.speed;
				}
				var sdist = -(Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2));
				var edist = -(Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet - len) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed,
					2));
				var x = (daNote.mustPress ? 690 : 520) + Note.noteWidth[daNote.noteData] * 0.5;
				var y = (daNote.mustPress ? 468 - daNote.noteData * 112 : 132 + daNote.noteData * 112) + Note.noteHeight[daNote.noteData] * 0.5;

				daNote.renderer = new RenderPath(1, [sdist, edist, x, y, daNote.width * 0.7, daNote.mustPress ? 270 : 90, 0]);
				if (Conductor.songPosition > daNote.strumTime - Conductor.stepCrochet
					&& (!daNote.mustPress || (daNote.wasGoodHit || (daNote.prevNote.wasGoodHit && !daNote.canBeHit))))
					daNote.renderer.bili = 1 - (Conductor.songPosition - daNote.strumTime + Conductor.stepCrochet) / len;
				daNote.pathrender();
			}
			else if (daNote.mustPress)
			{
				daNote.x = (690 - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				daNote.y = 468 - daNote.noteData * 112;
			}
			else
			{
				daNote.x = (520 + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				daNote.y = 132 + daNote.noteData * 112;
			}
		}
		else if (daNote.strumTime >= 109367 && daNote.strumTime < 121330)
		{
			
			var z = 800 * (daNote.strumTime - Conductor.songPosition) / 379.746835444;
			var x0 = 640 - Note.swagWidth * (4 - daNote.noteData);
			var x = 640 - Note.swagWidth * (4 - daNote.noteData) + Note.swagWidth / 1.4;
			if (daNote.mustPress)
			{
				x0 = 640 + Note.swagWidth * daNote.noteData;
				x = 640 + Note.swagWidth * daNote.noteData + Note.swagWidth / 1.4;
			}

			var nx0 = NoteObject.toScreen(x0, 360, z)[0];
			var nx = NoteObject.toScreen(x, 360, z)[0];
			daNote.setGraphicSize(Std.int((nx - nx0) * 2));
			daNote.updateHitbox();
			daNote.x = nx - daNote.width / 2;
			daNote.y = 360 - daNote.height / 2;
			if (Conductor.songPosition > daNote.strumTime)
				daNote.alpha = 0;
		}
		else if (daNote.strumTime >= 121518 && daNote.strumTime < 145633)
		{
			if (daNote.mustPress)
			{
				daNote.x = 538 + (PlayMoving.poxlist[daNote.noteData] - 538) * FlxMath.fastCos(daNote.strumTime / 1518.98734177 * 3.1415926);
				daNote.y = 300 - (100 + 50 * daNote.noteData) * FlxMath.fastSin(daNote.strumTime / 1518.98734177 * 3.1415926);
			}
			else
			{
				daNote.x = 538 - (538 - PlayMoving.oxlist[daNote.noteData]) * FlxMath.fastCos(daNote.strumTime / 1518.98734177 * 3.1415926);
				daNote.y = 300 + (100 + 50 * (3 - daNote.noteData)) * FlxMath.fastSin(daNote.strumTime / 1518.98734177 * 3.1415926);
			}
		}
		else
		{
			if (FlxG.save.data.downscroll)
				daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
	}
function spos(dastrum, strumLine){
		if (Conductor.songPosition >= 24303.797468354438 && Conductor.songPosition < 30379.746835443053)
		{
			if (Conductor.songPosition % 759.493670886 < 379.746835443)
			{
				if (dastrum.ID % 2 == 0)
				{
					if (FlxG.save.data.downscroll)
					{
						dastrum.y = 450;
						PlayMoving.ylist[dastrum.ID] = 450;
					}
					else
					{
						dastrum.y = 150;
						PlayMoving.ylist[dastrum.ID] = 150;
					}
				}
				else
				{
					if (FlxG.save.data.downscroll)
					{
						dastrum.y = 550;
						PlayMoving.ylist[dastrum.ID] = 550;
					}
					else
					{
						dastrum.y = 50;
						PlayMoving.ylist[dastrum.ID] = 50;
					}
				}
			}
			else
			{
				if (dastrum.ID % 2 == 0)
				{
					if (FlxG.save.data.downscroll)
					{
						dastrum.y = 550;
						PlayMoving.ylist[dastrum.ID] = 550;
					}
					else
					{
						dastrum.y = 50;
						PlayMoving.ylist[dastrum.ID] = 50;
					}
				}
				else
				{
					if (FlxG.save.data.downscroll)
					{
						dastrum.y = 450;
						PlayMoving.ylist[dastrum.ID] = 450;
					}
					else
					{
						dastrum.y = 150;
						PlayMoving.ylist[dastrum.ID] = 150;
					}
				}
			}
		}
		else if (Conductor.songPosition >= 30379.746835443053 && Conductor.songPosition < 31189.873417721534)
		{
			if (FlxG.save.data.downscroll)
				dastrum.y = 550;
			else
				dastrum.y = 50;
		}
		else if (Conductor.songPosition >= 36455.69620253167 && Conductor.songPosition < 48227.84810126586)
		{
			if (dastrum.x > 640)
			{
				dastrum.x = 1110;
				dastrum.y = 132 + dastrum.ID * 112;
			}
			else
			{
				dastrum.x = 50;
				dastrum.y = 468 - dastrum.ID * 112;
			}
		}
		else if (Conductor.songPosition >= 48227.84810126586 && Conductor.songPosition < 48987.341772151936)
		{
			if (Conductor.songPosition < 48607.5949367089)
			{
				if (dastrum.x < 640)
				{
					switch (dastrum.ID)
					{
						case 0:
							dastrum.x = 50;
							dastrum.y = 468 - (Conductor.songPosition - 48227.84810126586) / 379.746835443 * (168);
						break;
case 1:
							dastrum.x = 50 + (Conductor.songPosition - 48227.84810126586) / 379.746835443 * (210);
							dastrum.y = 356 + (Conductor.songPosition - 48227.84810126586) / 379.746835443 * (154);
						break;
case 2:
							dastrum.x = 50 + (Conductor.songPosition - 48227.84810126586) / 379.746835443 * (210);
							dastrum.y = 244 - (Conductor.songPosition - 48227.84810126586) / 379.746835443 * (154);
						break;
case 3:
							dastrum.x = 50 + (Conductor.songPosition - 48227.84810126586) / 379.746835443 * (420);
							dastrum.y = 132 + (Conductor.songPosition - 48227.84810126586) / 379.746835443 * (168);
					break;
}
				}
			}
			else
			{
				if (dastrum.x > 640)
				{
					switch (dastrum.ID)
					{
						case 0:
							dastrum.x = 1110 - (Conductor.songPosition - 48607.5949367089) / 379.746835443 * (420);
							dastrum.y = 132 + (Conductor.songPosition - 48607.5949367089) / 379.746835443 * (168);
						break;
case 1:
							dastrum.x = 1110 - (Conductor.songPosition - 48607.5949367089) / 379.746835443 * (210);
							dastrum.y = 244 + (Conductor.songPosition - 48607.5949367089) / 379.746835443 * (266);
						break;
case 2:
							dastrum.x = 1110 - (Conductor.songPosition - 48607.5949367089) / 379.746835443 * (210);
							dastrum.y = 356 - (Conductor.songPosition - 48607.5949367089) / 379.746835443 * (266);
						break;
case 3:
							dastrum.x = 1110;
							dastrum.y = 468 - (Conductor.songPosition - 48607.5949367089) / 379.746835443 * (168);
					break;
}
				}
				else
				{
					switch (dastrum.ID)
					{
						case 0:
							dastrum.x = 50;
							dastrum.y = 300;
						break;
case 1:
							dastrum.x = 260;
							dastrum.y = 510;
						break;
case 2:
							dastrum.x = 260;
							dastrum.y = 90;
						break;
case 3:
							dastrum.x = 470;
							dastrum.y = 300;
					break;
}
				}
			}
		}
		else if (Conductor.songPosition >= 48987.341772151936 && Conductor.songPosition < 49987.341772151936)
		{
			if (dastrum.x > 640)
			{
				switch (dastrum.ID)
				{
					case 0:
						dastrum.x = 690;
						dastrum.y = 300;
					break;
case 1:
						dastrum.x = 900;
						dastrum.y = 510;
					break;
case 2:
						dastrum.x = 900;
						dastrum.y = 90;
					break;
case 3:
						dastrum.x = 1110;
						dastrum.y = 300;
				break;
}
			}
		}
		else if (Conductor.songPosition >= 72911.39240506335 && Conductor.songPosition < 78797.46835443044)
		{
			if (Conductor.songPosition < 73101.26582278487)
				dastrum.alpha = (73101.26582278487 - Conductor.songPosition) / 189.873417722;
			else
				dastrum.alpha = 0;
		}
		else if (Conductor.songPosition >= 78987.34177215197 && Conductor.songPosition < 91044.30379746843)
		{
			if (Conductor.songPosition < 79177.21518987349)
				dastrum.alpha = (Conductor.songPosition - 78987.34177215197) / 189.873417722;
			else
				dastrum.alpha = 1;
			if (Conductor.songPosition < 85063.29113924058)
			{
				if (dastrum.x < 640)
				{
					if (FlxG.save.data.downscroll)
						dastrum.y = 550 - 500 * (Conductor.songPosition - 78987.34177215197) / 6075.94936709;
					else
						dastrum.y = 50 + 500 * (Conductor.songPosition - 78987.34177215197) / 6075.94936709;
				}
			}
			else
			{
				if (dastrum.x > 640)
				{
					if (FlxG.save.data.downscroll)
						dastrum.y = 550 - 500 * (Conductor.songPosition - 85063.29113924058) / 6075.94936709;
					else
						dastrum.y = 50 + 500 * (Conductor.songPosition - 85063.29113924058) / 6075.94936709;
				}
			}
		}
		else if (Conductor.songPosition >= 91139.2405063292 && Conductor.songPosition < 97025.31645569629)
		{
			if (Conductor.songPosition % 1518.98734177 < 379.746835443)
			{
				if (dastrum.x > 640)
				{
					if (dastrum.ID % 2 == 0)
					{
						dastrum.x = PlayMoving.poxlist[dastrum.ID]
							+ (Conductor.songPosition % 379.746835443) / 379.746835443 * (PlayMoving.poxlist[dastrum.ID + 1] - PlayMoving.poxlist[dastrum.ID]);
						PlayMoving.pxlist[dastrum.ID] = dastrum.x;
					}
					else
					{
						dastrum.x = PlayMoving.poxlist[dastrum.ID]
							+ (Conductor.songPosition % 379.746835443) / 379.746835443 * (PlayMoving.poxlist[dastrum.ID - 1] - PlayMoving.poxlist[dastrum.ID]);
						PlayMoving.pxlist[dastrum.ID] = dastrum.x;
					}
				}
				else
				{
					if (dastrum.ID % 2 == 0)
					{
						dastrum.x = PlayMoving.oxlist[dastrum.ID]
							+ (Conductor.songPosition % 379.746835443) / 379.746835443 * (PlayMoving.oxlist[dastrum.ID + 1] - PlayMoving.oxlist[dastrum.ID]);
						PlayMoving.xlist[dastrum.ID] = dastrum.x;
					}
					else
					{
						dastrum.x = PlayMoving.oxlist[dastrum.ID]
							+ (Conductor.songPosition % 379.746835443) / 379.746835443 * (PlayMoving.oxlist[dastrum.ID - 1] - PlayMoving.oxlist[dastrum.ID]);
						PlayMoving.xlist[dastrum.ID] = dastrum.x;
					}
				}
			}
			else if (Conductor.songPosition % 1518.98734177 >= 759.493670886 && Conductor.songPosition % 1518.98734177 < 1139.24050633)
			{
				if (dastrum.x > 640)
				{
					if (dastrum.ID % 2 == 0)
					{
						dastrum.x = PlayMoving.poxlist[dastrum.ID + 1]
							- (Conductor.songPosition % 379.746835443) / 379.746835443 * (PlayMoving.poxlist[dastrum.ID + 1] - PlayMoving.poxlist[dastrum.ID]);
						PlayMoving.pxlist[dastrum.ID] = dastrum.x;
					}
					else
					{
						dastrum.x = PlayMoving.poxlist[dastrum.ID - 1]
							- (Conductor.songPosition % 379.746835443) / 379.746835443 * (PlayMoving.poxlist[dastrum.ID - 1] - PlayMoving.poxlist[dastrum.ID]);
						PlayMoving.pxlist[dastrum.ID] = dastrum.x;
					}
				}
				else
				{
					if (dastrum.ID % 2 == 0)
					{
						dastrum.x = PlayMoving.oxlist[dastrum.ID + 1]
							- (Conductor.songPosition % 379.746835443) / 379.746835443 * (PlayMoving.oxlist[dastrum.ID + 1] - PlayMoving.oxlist[dastrum.ID]);
						PlayMoving.xlist[dastrum.ID] = dastrum.x;
					}
					else
					{
						dastrum.x = PlayMoving.oxlist[dastrum.ID - 1]
							- (Conductor.songPosition % 379.746835443) / 379.746835443 * (PlayMoving.oxlist[dastrum.ID - 1] - PlayMoving.oxlist[dastrum.ID]);
						PlayMoving.xlist[dastrum.ID] = dastrum.x;
					}
				}
			}
		}
		else if (Conductor.songPosition >= 97215.18987341781 && Conductor.songPosition < 109177.21518987352)
		{
			if (dastrum.x > 640)
			{
				dastrum.x = 690;
				dastrum.y = 468 - dastrum.ID * 112;
			}
			else
			{
				dastrum.x = 520;
				dastrum.y = 132 + dastrum.ID * 112;
			}
		}
		else if (Conductor.songPosition >= 109367.08860759504 && Conductor.songPosition < 110886.0759493672)
		{
			if (Conductor.songPosition < 109556.962025)
			{
				dastrum.scale.x = (109556.962025 - Conductor.songPosition) / 189.873417722 * 0.7;
				dastrum.scale.y = (109556.962025 - Conductor.songPosition) / 189.873417722 * 0.7;
			}
			else
				dastrum.alpha = 0;
		}
		else if (Conductor.songPosition >= 121139.24050632922 && Conductor.songPosition < 121329.11392405075)
		{
			if (dastrum.x > 640)
				dastrum.x = PlayMoving.poxlist[dastrum.ID];
			else
				dastrum.x = PlayMoving.oxlist[dastrum.ID];
			dastrum.y = 300;
			dastrum.alpha = 1;
			dastrum.x = 538 - (538 - PlayMoving.oxlist[dastrum.ID]) * FlxMath.fastCos(Conductor.songPosition / 1518.98734177 * 3.1415926);
			dastrum.y = 300 + (100 + 50 * (3 - dastrum.ID)) * FlxMath.fastSin(Conductor.songPosition / 1518.98734177 * 3.1415926);
			dastrum.scale.x = (Conductor.songPosition - 121139.24050632922) / 189.873417722 * 0.7;
			dastrum.scale.y = (Conductor.songPosition - 121139.24050632922) / 189.873417722 * 0.7;
		}
		else if (Conductor.songPosition >= 121518.98734177227 && Conductor.songPosition < 145822.78481)
		{
			dastrum.scale.x = 0.7;
			dastrum.scale.y = 0.7;
			dastrum.x = 538 - (538 - PlayMoving.oxlist[dastrum.ID]) * FlxMath.fastCos(Conductor.songPosition / 1518.98734177 * 3.1415926);
			dastrum.y = 300 + (100 + 50 * (3 - dastrum.ID)) * FlxMath.fastSin(Conductor.songPosition / 1518.98734177 * 3.1415926);
		}
	}
function pspos(dastrum, strumLine){
		if (Conductor.songPosition >= 121139.24050632922 && Conductor.songPosition < 145822.78481)
		{
			dastrum.scale.x = 0.7;
			dastrum.scale.y = 0.7;
			dastrum.x = 538 + (PlayMoving.poxlist[dastrum.ID] - 538) * FlxMath.fastCos(Conductor.songPosition / 1518.98734177 * 3.1415926);
			dastrum.y = 300 - (100 + 50 * dastrum.ID) * FlxMath.fastSin(Conductor.songPosition / 1518.98734177 * 3.1415926);
		}
	}
function show(daNote){
		if (Conductor.songPosition >= 36455.69620253167 && daNote.strumTime < 48418)
		{
			if (daNote.isSustainNote)
				return false;
			if (daNote.mustPress)
				return daNote.x < 640;
			else
				return daNote.x > 640;
		}
		else if (daNote.strumTime >= 48607 && daNote.strumTime < 60570)
		{
			if (daNote.isSustainNote)
				return false;
			if (daNote.mustPress)
			{
				switch (daNote.noteData)
				{
					case 0:
						return daNote.x > 900;
					break;
case 3:
						return daNote.x < 900;
					break;
case 1:
						return daNote.y < 300;
					break;
default:
						return daNote.y > 300;
				break;
}
			}
			else
			{
				switch (daNote.noteData)
				{
					case 0:
						return daNote.x > 260;
					break;
case 3:
						return daNote.x < 260;
					break;
case 1:
						return daNote.y < 300;
					break;
default:
						return daNote.y > 300;
				break;
}
			}
		}
		else if (daNote.strumTime >= 109367 && daNote.strumTime < 121330)
			return daNote.strumTime - Conductor.songPosition > 379.746835444;
		else if (daNote.strumTime >= 121518 && daNote.strumTime < 145633)
			return daNote.strumTime - Conductor.songPosition > 759.493670885;
		else
		{
			if (FlxG.save.data.downscroll)
				return daNote.y < -daNote.height;
			else
				return daNote.y > FlxG.height;
		}
	}
function kill(daNote){
		if (Conductor.songPosition >= 36455.69620253167 && daNote.strumTime < 48418)
		{
			if (daNote.mustPress)
				return daNote.x > FlxG.width;
			else
				return false;
		}
		else if (daNote.strumTime >= 48607 && daNote.strumTime < 60570)
		{
			if (daNote.mustPress)
				return (daNote.x > FlxG.width || daNote.x < 640 || daNote.y < -daNote.height || daNote.y > FlxG.height)
					&& Conductor.songPosition > daNote.strumTime;
			else
				return false;
		}
		else if (daNote.strumTime >= 78987 && daNote.strumTime < 91045)
			return ((daNote.y < -daNote.height) || (daNote.y > FlxG.height)) && Conductor.songPosition > daNote.strumTime;
		else if (daNote.strumTime >= 91139 && daNote.strumTime < 97026)
		{
			if (FlxG.save.data.downscroll)
				return daNote.y < -daNote.height;
			else
				return daNote.y > FlxG.height;
		}
		else if (daNote.strumTime >= 97215 && daNote.strumTime < 109178)
		{
			if (daNote.mustPress)
				return daNote.x < -daNote.width;
			else
				return daNote.x > FlxG.width;
		}
		else if (daNote.strumTime >= 109367 && daNote.strumTime < 121330)
		{
			return Conductor.songPosition - daNote.strumTime > (1000 / 6);
		}
		else if (daNote.strumTime >= 121518 && daNote.strumTime < 145633)
			return Conductor.songPosition - daNote.strumTime > (1000 / 6);
		else
		{
			if (FlxG.save.data.downscroll)
				return daNote.y > FlxG.height;
			else
				return daNote.y < -daNote.height;
		}
	}
function ups(daNote, strumLine){
		if (Conductor.songPosition >= 36455.69620253167 && daNote.strumTime < 48418)
		{
			if (daNote.mustPress)
				return 3;
			else
				return 0;
		}
		else if (daNote.strumTime >= 48607 && daNote.strumTime < 60570)
			return daNote.noteData;
		else if (daNote.strumTime >= 91139 && daNote.strumTime < 97026)
		{
			if (FlxG.save.data.downscroll)
			{
				daNote.angle = 0;
				return 2;
			}
			else
			{
				daNote.angle = 180;
				return 1;
			}
		}
		else if (daNote.strumTime >= 97215 && daNote.strumTime < 109178)
		{
			if (daNote.mustPress)
				return 0;
			else
				return 3;
		}
		else
		{
			if (FlxG.save.data.downscroll)
			{
				daNote.angle = 180;
				return 1;
			}
			else
			{
				daNote.angle = 0;
				return 2;
			}
		}
	}
function stry(daNote, strumLine){
		if (daNote.strumTime >= 24303 && daNote.strumTime < 30190)
			return PlayMoving.ylist[daNote.noteData];
		if (Conductor.songPosition >= 36455.69620253167 && daNote.strumTime < 48418)
		{
			if (daNote.mustPress)
				return 1110;
			else
				return 50;
		}
		else if (daNote.strumTime >= 48607 && daNote.strumTime < 60570)
		{
			if (daNote.mustPress)
			{
				switch (daNote.noteData)
				{
					case 0:
						return 690;
					break;
case 3:
						return 1110;
					break;
case 1:
						return 510;
					break;
default:
						return 90;
				break;
}
			}
			else
			{
				switch (daNote.noteData)
				{
					case 0:
						return 50;
					break;
case 3:
						return 470;
					break;
case 1:
						return 510;
					break;
default:
						return 90;
				break;
}
			}
		}
		else if (daNote.strumTime >= 91139 && daNote.strumTime < 97026)
			return 550;
		else if (daNote.strumTime >= 97215 && daNote.strumTime < 109178)
		{
			if (daNote.mustPress)
				return 690;
			else
				return 520;
		}
		else
			return strumLine.y;
	}
return {pos,spos,pspos,show,kill,ups,stry};};
GALAXY_NATIVE['cyber']=function(env){const {Conductor,FlxG,FlxMath,PlayState,PlayMoving,PlayWindow,Lib,Note,NoteObject,Std,RenderPath,FixedScaleMode,RatioScaleMode}=env;let count=0;function nreset(){
		count = 0;
	}
function pos(daNote, strumLine){
		if (Conductor.songPosition >= 70280.8988764045 && Conductor.songPosition < 91595.50561797764)
			daNote.y = (PlayMoving.sy
				- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(((300 - PlayMoving.sy) / 250) * PlayState.SONG.speed, 2)));
		else if (Conductor.songPosition >= 124044.94382022502 && Conductor.songPosition < 145617.977528)
		{
			if (FlxG.save.data.downscroll)
				daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			if ((!FlxG.save.data.downscroll
				&& (((Conductor.songPosition - 124044.94382022502) % 2696.62921348 < 1348.31460674 && daNote.y <= PlayMoving.sy)
					|| ((Conductor.songPosition - 124044.94382022502) % 2696.62921348 >= 1348.31460674 && daNote.y > PlayMoving.sy)))
				|| (FlxG.save.data.downscroll
					&& (((Conductor.songPosition - 124044.94382022502) % 2696.62921348 < 1348.31460674 && daNote.y >= PlayMoving.sy)
						|| ((Conductor.songPosition - 124044.94382022502) % 2696.62921348 >= 1348.31460674 && daNote.y < PlayMoving.sy))))
			{
				if (daNote.mustPress)
					daNote.x = PlayMoving.poxlist[daNote.noteData];
				else
					daNote.x = PlayMoving.oxlist[daNote.noteData];
			}
			else
			{
				if (daNote.mustPress)
					daNote.x = PlayMoving.poxlist[3 - daNote.noteData];
				else
					daNote.x = PlayMoving.oxlist[3 - daNote.noteData];
			}
			if (daNote.isSustainNote)
				daNote.x += daNote.width;
		}
		else if (daNote.strumTime >= 145617 && daNote.strumTime < 156236)
		{
			if (daNote.mustPress)
				daNote.x = PlayMoving.poxlist[daNote.noteData];
			else
				daNote.x = PlayMoving.oxlist[daNote.noteData];
			if (daNote.isSustainNote)
				daNote.x += daNote.width;
			else
				daNote.angle += 5;
			if (FlxG.save.data.downscroll)
				daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
		else if (daNote.strumTime >= 156404 && daNote.strumTime < 168456 && Conductor.songPosition < 167191.0112359552)
		{
			if (daNote.mustPress)
				daNote.x = PlayMoving.poxlist[daNote.noteData]
					+ (FlxMath.fastSin((daNote.strumTime - 156404.49438202268) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[0] * 2 / 10)
						+ PlayWindow.stage[0] / 2 - Lib.application.window.x - 320) * 2;
			else
				daNote.x = PlayMoving.oxlist[daNote.noteData]
					+ (FlxMath.fastSin((daNote.strumTime - 156404.49438202268) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[0] * 2 / 10)
						+ PlayWindow.stage[0] / 2 - Lib.application.window.x - 320) * 2;
			daNote.y = strumLine.y
				+ (FlxMath.fastCos((daNote.strumTime - 156404.49438202268) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[1] * -2 / 10)
					+ PlayWindow.stage[1] / 2 - Lib.application.window.y - 180) * 2;
		}
		else if (Conductor.songPosition >= 167191.0112359552 && Conductor.songPosition < 172584.26966292146)
		{
			if (daNote.mustPress)
				daNote.x = PlayMoving.poxlist[daNote.noteData];
			else
				daNote.x = PlayMoving.oxlist[daNote.noteData];
			if (daNote.strumTime % 2696.62921348 < 1348.31460674)
				if (daNote.strumTime % 1348.31460674 < 674.157303371)
					daNote.y = (50
						+ 500 * (daNote.strumTime % 1348.31460674) / 1348.31460674
						- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
				else
					daNote.y = (50
						+ 500 * (daNote.strumTime % 1348.31460674) / 1348.31460674
						+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else if (daNote.strumTime % 1348.31460674 < 674.157303371)
				daNote.y = (550
					- 500 * (daNote.strumTime % 1348.31460674) / 1348.31460674
					+ (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (550
					- 500 * (daNote.strumTime % 1348.31460674) / 1348.31460674
					- (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
		else if (Conductor.songPosition >= 172584.26966292146 && Conductor.songPosition < 177977.52808988772)
		{
			if (daNote.mustPress)
				daNote.x = PlayMoving.pxlist[daNote.noteData];
			else
				daNote.x = PlayMoving.xlist[daNote.noteData];
			if (FlxG.save.data.downscroll)
				daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
		
		else
		{
			if (FlxG.save.data.downscroll)
				daNote.y = (strumLine.y + (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
			else
				daNote.y = (strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * FlxMath.roundDecimal(PlayState.SONG.speed, 2)));
		}
	}
function spos(dastrum, strumLine){
		if (Conductor.songPosition >= 48707.86516853933 && Conductor.songPosition < 58988.76404494382)
		{
			if (FlxG.save.data.downscroll)
				dastrum.y = 550 + ((Conductor.songPosition - 48707.86516853933) / 10280.8988764) * 160;
			else
				dastrum.y = 50 - ((Conductor.songPosition - 48707.86516853933) / 10280.8988764) * 160;
			strumLine.y = dastrum.y;
		}
		else if (Conductor.songPosition >= 59325.84269662921 && Conductor.songPosition < 59494.38202247191)
		{
			if (FlxG.save.data.downscroll)
				dastrum.y = 550;
			else
				dastrum.y = 50;
			strumLine.y = dastrum.y;
		}
		else if (Conductor.songPosition >= 59494.38202247191 && Conductor.songPosition < 69775.28089887642)
		{
			if (FlxG.save.data.downscroll)
				dastrum.y = 550 + ((Conductor.songPosition - 59494.38202247191) / 10280.8988764) * 160;
			else
				dastrum.y = 50 - ((Conductor.songPosition - 59494.38202247191) / 10280.8988764) * 160;
			strumLine.y = dastrum.y;
		}
		else if (Conductor.songPosition >= 70112.35955056181 && Conductor.songPosition < 70280.8988764045)
		{
			if (FlxG.save.data.downscroll)
				dastrum.y = 550;
			else
				dastrum.y = 50;
			strumLine.y = dastrum.y;
		}
		else if (Conductor.songPosition >= 70280.8988764045 && Conductor.songPosition < 91595.50561797764)
		{
			dastrum.y = 300 - FlxMath.fastSin(((Conductor.songPosition - 70280.8988764045) / 1348.31460674 - 0.5) * 3.1415926535) * 250;
			strumLine.y = dastrum.y;
			PlayMoving.sy = dastrum.y;
		}
		else if (Conductor.songPosition >= 91685.3932584271 && Conductor.songPosition < 93033.70786516868)
		{
			if (FlxG.save.data.downscroll)
				dastrum.y = 550;
			else
				dastrum.y = 50;
			strumLine.y = dastrum.y;
		}
		else if (Conductor.songPosition >= 124044.94382022502 && Conductor.songPosition < 145617.977528)
		{
			if ((Conductor.songPosition - 124044.94382022502) % 2696.62921348 < 1348.31460674)
			{
				if (dastrum.x > 640)
					dastrum.x = PlayMoving.poxlist[dastrum.ID];
				else
					dastrum.x = PlayMoving.oxlist[dastrum.ID];
			}
			else
			{
				if (dastrum.x > 640)
					dastrum.x = PlayMoving.poxlist[3 - dastrum.ID];
				else
					dastrum.x = PlayMoving.oxlist[3 - dastrum.ID];
			}
			if (FlxG.save.data.downscroll)
				PlayMoving.sy = 550 - ((Conductor.songPosition - 124044.94382022502) % 1348.31460674) / 1348.31460674 * 1230;
			else
				PlayMoving.sy = 50 + ((Conductor.songPosition - 124044.94382022502) % 1348.31460674) / 1348.31460674 * 1230;
		}
		else if (Conductor.songPosition >= 145617.97752809015 && Conductor.songPosition < 156067.4157303373)
		{
			if (dastrum.x > 640)
				dastrum.x = PlayMoving.poxlist[dastrum.ID];
			else
				dastrum.x = PlayMoving.oxlist[dastrum.ID];
		}
		else if (Conductor.songPosition >= 156067.4157303373 && Conductor.songPosition < 156235.95505617998)
		{
			if (FlxG.save.data.downscroll)
				dastrum.y = 550 - (Conductor.songPosition - 156067.4157303373) / 168.539325843 * 250;
			else
				dastrum.y = 50 + (Conductor.songPosition - 156067.4157303373) / 168.539325843 * 250;
			strumLine.y = dastrum.y;
		}
		else if (Conductor.songPosition >= 167191.0112359552 && Conductor.songPosition < 172584.26966292146)
		{
			if (Conductor.songPosition % 2696.62921348 < 1348.31460674)
				dastrum.y = 50 + 500 * (Conductor.songPosition % 1348.31460674) / 1348.31460674;
			else
				dastrum.y = 550 - 500 * (Conductor.songPosition % 1348.31460674) / 1348.31460674;
		}
		else if (Conductor.songPosition >= 172584.26966292146 && Conductor.songPosition < 177977.52808988772)
		{
			if (FlxG.save.data.downscroll)
				dastrum.y = 550;
			else
				dastrum.y = 50;
			strumLine.y = dastrum.y;
			dastrum.scale.x = 0.7;
			dastrum.scale.y = 0.7;
			if (dastrum.x > 640)
			{
				dastrum.x = PlayMoving.poxlist[dastrum.ID];
			}
			else
			{
				dastrum.x = PlayMoving.oxlist[dastrum.ID];
			}
		}
		
	}
function show(daNote){
		if (Conductor.songPosition >= 70280.8988764045 && Conductor.songPosition < 91595.50561797764)
			return (Math.abs(daNote.y - 300) > Math.abs(((300 - PlayMoving.sy) / 250)) * 360);
		else if (daNote.strumTime >= 156404 && daNote.strumTime < 168456 && Conductor.songPosition < 167191.0112359552)
			return Conductor.songPosition < 156404 || daNote.strumTime - Conductor.songPosition > 2696.62921348;
		else
		{
			if (FlxG.save.data.downscroll)
				return daNote.y < -daNote.height;
			else
				return daNote.y > FlxG.height;
		}
	}
function kill(daNote){
		if (daNote.strumTime >= 48707 && daNote.strumTime < 70029)
		{
			if (FlxG.save.data.downscroll)
				return daNote.y > FlxG.height && Conductor.songPosition > daNote.strumTime + 1000 / 6;
			else
				return daNote.y < -daNote.height && Conductor.songPosition > daNote.strumTime + 1000 / 6;
		}
		else if (Conductor.songPosition >= 70280.8988764045 && Conductor.songPosition < 91595.50561797764)
			return ((Math.abs(daNote.y - 300) > Math.abs(((300 - PlayMoving.sy) / 250)) * 50)
				&& Conductor.songPosition - daNote.strumTime > 1000 / 6);
		else if (daNote.strumTime >= 156404 && daNote.strumTime < 168456 && Conductor.songPosition < 167191.0112359552)
			return Conductor.songPosition > daNote.strumTime + 1000 / 6;
		else if (Conductor.songPosition >= 167191.0112359552 && Conductor.songPosition < 172584.26966292146)
			return Conductor.songPosition > daNote.strumTime + 1000 / 6;
		else
		{
			if (FlxG.save.data.downscroll)
				return daNote.y > FlxG.height;
			else
				return daNote.y < -daNote.height;
		}
	}
function move(camHUD){
		if (FlxG.fullscreen)
			FlxG.fullscreen = false;
		if (Conductor.songPosition % 20 < 10)
		{
			if (Conductor.songPosition < 5393.258426966292)
			{
				PlayWindow.reset();
			}
			else if (Conductor.songPosition >= 5393.258426966292 && Conductor.songPosition < 10702.247191011236)
			{ 
				var tar = [Std.int(PlayWindow.stage[0] / 2 - 320), Std.int(PlayWindow.stage[1] / 2 - 180)];
				Lib.application.window.width = Std.int(640 + (10702.247191011236 - Conductor.songPosition) / (5308.98876404) * (PlayWindow.res[2] - 640));
				Lib.application.window.height = Std.int(360 + (10702.247191011236 - Conductor.songPosition) / (5308.98876404) * (PlayWindow.res[3] - 360));
				Lib.application.window.x = Std.int(tar[0] + (10702.247191011236 - Conductor.songPosition) / (5308.98876404) * (PlayWindow.res[0] - tar[0]));
				Lib.application.window.y = Std.int(tar[1] + (10702.247191011236 - Conductor.songPosition) / (5308.98876404) * (PlayWindow.res[1] - tar[1]));
			}
			else if (Conductor.songPosition >= 10786.516853932584 && Conductor.songPosition < 16089.887640449437)
			{
				var bef = [Std.int(PlayWindow.stage[0] / 2 - 320), Std.int(PlayWindow.stage[1] / 2 - 180)];
				var tar = [
					Std.int(PlayWindow.stage[0] / 2 - 320),
					Std.int(PlayWindow.stage[1] * 3 / 10 - 180)
				];
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				Lib.application.window.x = Std.int(tar[0] + (16089.887640449437 - Conductor.songPosition) / (5303.37078652) * (bef[0] - tar[0]));
				Lib.application.window.y = Std.int(tar[1] + (16089.887640449437 - Conductor.songPosition) / (5303.37078652) * (bef[1] - tar[1]));
			}
			else if (Conductor.songPosition >= 16179.775280898875 && Conductor.songPosition < 25617.977528089887)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				Lib.application.window.x = Std.int(FlxMath.fastSin((Conductor.songPosition - 16179.775280898875) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[0] * 2 / 10)
					+ PlayWindow.stage[0] / 2
						- 320);
				Lib.application.window.y = Std.int(FlxMath.fastCos((Conductor.songPosition - 16179.775280898875) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[1] * -2 / 10)
					+ PlayWindow.stage[1] / 2
						- 180);
			}
			else if (Conductor.songPosition >= 25617.977528089887 && Conductor.songPosition < 26629.213483146068)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				Lib.application.window.x = Std.int(PlayWindow.stage[0] * 3 / 10 - 320);
				Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
			}
			else if (Conductor.songPosition >= 26629.213483146068 && Conductor.songPosition < 26882.02247191011)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				Lib.application.window.x = Std.int(PlayWindow.stage[0] * 3 / 10 - 320);
				Lib.application.window.y = Std.int((PlayWindow.stage[1] / -4)
					- 180
					+ (26882.02247191011 - Conductor.songPosition) / (252.808988764) * (PlayWindow.stage[1] / 2 + PlayWindow.stage[1] / 4));
			}
			else if (Conductor.songPosition >= 26966.29213483146 && Conductor.songPosition < 37673.49636483807)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				if (Conductor.songPosition < 27303.370786516854)
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0] - (Conductor.songPosition - 26966.29213483146) / 337.078651685 * 320);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
				}
				else if (Conductor.songPosition < 32022.47191011236)
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0] - 320 - (Conductor.songPosition - 27303.370786516854) / 4719.1011236 * 160);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
				}
				else if (Conductor.songPosition < 32359.55056179775)
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0]
						- 480
						- (Conductor.songPosition - 32022.47191011236) / 337.078651685 * (PlayWindow.stage[0] - 320));
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
				}
				else
					Lib.application.window.x = Std.int(-160 - (Conductor.songPosition - 33707.86516853933) / 4719.1011236 * (160));
				Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
			}
			else if (Conductor.songPosition >= 37752.808988764045 && Conductor.songPosition < 48117.9775281)
			{
				if (Std.int((Conductor.songPosition - 37752.808988764045) / 674.15730337) >= count)
				{
					PlayWindow.pos = [
						FlxG.random.int(480, PlayWindow.stage[0] - 480),
						FlxG.random.int(270, PlayWindow.stage[1] - 270)
					];
					count += 1;
				}
				if (Std.int((Conductor.songPosition - 37752.808988764045) / 337.078651685) % 2 == 0)
				{
					Lib.application.window.width = 960;
					Lib.application.window.height = 540;
				}
				else
				{
					Lib.application.window.width = Std.int(960 - ((Conductor.songPosition - 37752.808988764045) % 337.078651685) / 337.078651685 * 640);
					Lib.application.window.height = Std.int(540 - ((Conductor.songPosition - 37752.808988764045) % 337.078651685) / 337.078651685 * 360);
				}
				Lib.application.window.x = Std.int(PlayWindow.pos[0] - Lib.application.window.width / 2);
				Lib.application.window.y = Std.int(PlayWindow.pos[1] - Lib.application.window.height / 2);
			}
			else if (Conductor.songPosition >= 48117.9775281 && Conductor.songPosition < 48455.05617977528)
			{
				Lib.application.window.width = 960;
				Lib.application.window.height = 540;
				if (FlxG.save.data.downscroll)
				{
					Lib.application.window.x = Std.int(PlayWindow.pos[0] - 480);
					Lib.application.window.y = Std.int(PlayWindow.pos[1]
						+ (Conductor.songPosition - 48117.9775281) / 337.078651685 * (PlayWindow.stage[1] * (-0.3) - PlayWindow.pos[1])
						- 270);
				}
				else
				{
					Lib.application.window.x = Std.int(PlayWindow.pos[0] - 480);
					Lib.application.window.y = Std.int(PlayWindow.pos[1]
						+ (Conductor.songPosition - 48117.9775281) / 337.078651685 * (PlayWindow.stage[1] * 1.3 - PlayWindow.pos[1])
						- 270);
				}
			}
			else if (Conductor.songPosition >= 48539.32584269663 && Conductor.songPosition < 70112.3595505)
			{
				count = 0;
				FlxG.scaleMode = new FixedScaleMode();
				if (Lib.application.window.width != 480 || Lib.application.window.height != 640)
				{
					Lib.application.window.width = 480;
					Lib.application.window.height = 640;
				}
				PlayWindow.camz = 0.9;
				if (Conductor.songPosition < 48707.86516853933)
				{
					if (FlxG.save.data.downscroll)
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (1.3)
							- ((Conductor.songPosition - 48539.32584269663) / 168.539325843) * (PlayWindow.stage[1] * 0.8)
							- 320);
					}
					else
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (-0.3)
							+ ((Conductor.songPosition - 48539.32584269663) / 168.539325843) * (PlayWindow.stage[1] * 0.8)
							- 320);
					}
					camHUD.x = 320;
				}
				else if (Conductor.songPosition < 58988.76404494382)
				{
					if (FlxG.save.data.downscroll)
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (0.5)
							- ((Conductor.songPosition - 48707.86516853933) / 10280.8988764) * 144
							- 320);
					}
					else
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (0.5)
							+ ((Conductor.songPosition - 48707.86516853933) / 10280.8988764) * 144
							- 320);
					}
					camHUD.x = 320;
				}
				else if (Conductor.songPosition < 59325.84269662921)
				{
					if (FlxG.save.data.downscroll)
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (0.5)
							- 144
							- ((Conductor.songPosition - 58988.76404494382) / 337.078651685) * (PlayWindow.stage[1] * 0.8 - 144)
							- 320);
					}
					else
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (0.5)
							+ 144
							+ ((Conductor.songPosition - 58988.76404494382) / 337.078651685) * (PlayWindow.stage[1] * 0.8 - 144)
							- 320);
					}
					camHUD.x = 320;
				}
				else if (Conductor.songPosition < 59494.38202247191)
				{
					if (FlxG.save.data.downscroll)
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (1.3)
							- ((Conductor.songPosition - 59325.84269662921) / 168.539325843) * (PlayWindow.stage[1] * 0.8)
							- 320);
					}
					else
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (-0.3)
							+ ((Conductor.songPosition - 59325.84269662921) / 168.539325843) * (PlayWindow.stage[1] * 0.8)
							- 320);
					}
					camHUD.x = -260;
				}
				else if (Conductor.songPosition < 69775.28089887642)
				{
					if (FlxG.save.data.downscroll)
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (0.5)
							- ((Conductor.songPosition - 59494.38202247191) / 10280.8988764) * 144
							- 320);
					}
					else
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (0.5)
							+ ((Conductor.songPosition - 59494.38202247191) / 10280.8988764) * 144
							- 320);
					}
					camHUD.x = -260;
				}
				else if (Conductor.songPosition < 70112.3595505)
				{
					if (FlxG.save.data.downscroll)
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (0.5)
							- 144
							- ((Conductor.songPosition - 69775.28089887642) / 337.078651685) * (PlayWindow.stage[1] * 0.8 - 144)
							- 320);
					}
					else
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7 - 240);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] * (0.5)
							+ 144
							+ ((Conductor.songPosition - 69775.28089887642) / 337.078651685) * (PlayWindow.stage[1] * 0.8 - 144)
							- 320);
					}
					camHUD.x = -260;
				}
			}
			else if (Conductor.songPosition >= 70112.35955056181 && Conductor.songPosition < 70280.8988764045)
			{
				camHUD.x = 0;
				PlayWindow.camz = 1;
				FlxG.scaleMode = new RatioScaleMode();
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 320);
				Lib.application.window.y = Std.int(PlayWindow.stage[1]
					- (Conductor.songPosition - 70112.35955056181) / 168.539325843 * (PlayWindow.stage[1] / 2 + 55));
			}
			else if (Conductor.songPosition >= 70280.8988764045 && Conductor.songPosition < 91595.50561797764)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				if (Conductor.songPosition >= 80898.87640449445)
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2
						+ FlxMath.fastSin(((Conductor.songPosition - 80898.87640449445) / 1348.31460674) * 3.1415926535) * PlayWindow.stage[0] / 5 - 320);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
						+ FlxMath.fastSin(((Conductor.songPosition - 70280.8988764045) / 1348.31460674 - 0.5) * 3.1415926535) * 125
						- 180);
				}
				else
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 320);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
						+ FlxMath.fastSin(((Conductor.songPosition - 70280.8988764045) / 1348.31460674 - 0.5) * 3.1415926535) * 125
						- 180);
				}
			}
			else if (Conductor.songPosition >= 91685.3932584271 && Conductor.songPosition < 102471.91011235974)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				if (Conductor.songPosition % 40 < 20)
				{
					Lib.application.window.x = Std.int(FlxMath.fastSin(((Conductor.songPosition - 16179.775280898875) / (2696.62921348)
						+ 1) * 3.1415926535) * (PlayWindow.stage[0] * 2 / 10)
						+ PlayWindow.stage[0] / 2
							- 320);
					Lib.application.window.y = Std.int(FlxMath.fastCos(((Conductor.songPosition - 16179.775280898875) / (2696.62921348)
						+ 1) * 3.1415926535) * (PlayWindow.stage[1] * -2 / 10)
						+ PlayWindow.stage[1] / 2
							- 180);
				}
				else
				{
					Lib.application.window.x = Std.int(FlxMath.fastSin((Conductor.songPosition - 16179.775280898875) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[0] * 2 / 10)
						+ PlayWindow.stage[0] / 2
							- 320);
					Lib.application.window.y = Std.int(FlxMath.fastCos((Conductor.songPosition - 16179.775280898875) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[1] * -2 / 10)
						+ PlayWindow.stage[1] / 2
							- 180);
				}
			}
			else if (Conductor.songPosition >= 102471.91011235974 && Conductor.songPosition < 113258.42696629238)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				if ((Conductor.songPosition - 102471.91011235974) % 674.157303371 < 337.078651685)
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 4 / 10
						+ (((Conductor.songPosition - 102471.91011235974) % 337.078651685) / 337.078651685) * PlayWindow.stage[0] / 5 - 320);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
						- Math.abs(FlxMath.fastSin(((Conductor.songPosition - 102471.91011235974) % 337.078651685) / 337.078651685 * 3.1415926)) * PlayWindow.stage[1] / 10 - 180);
				}
				else
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 6 / 10
						- (((Conductor.songPosition - 102471.91011235974) % 337.078651685) / 337.078651685) * PlayWindow.stage[0] / 5 - 320);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
						- Math.abs(FlxMath.fastSin(((Conductor.songPosition - 102471.91011235974) % 337.078651685) / 337.078651685 * 3.1415926)) * PlayWindow.stage[1] / 10 - 180);
				}
			}
			else if (Conductor.songPosition >= 113258.42696629238 && Conductor.songPosition < 123707.86516853962)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				if ((Conductor.songPosition - 102471.91011235974) % 674.157303371 < 337.078651685)
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 640);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
				}
				else
				{
					Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
				}
			}
			else if (Conductor.songPosition >= 123707.86516853962 && Conductor.songPosition < 156235.95505617998)
			{
				count = 0;
				FlxG.scaleMode = new FixedScaleMode();
				if (Conductor.songPosition < 145617.97752809015)
					PlayWindow.camz = 0.9;
				if (Conductor.songPosition < 124044.94382022502)
				{
					Lib.application.window.width = 480;
					Lib.application.window.height = 1;
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 320);
					camHUD.x = 320;
				}
				else if (Conductor.songPosition < 124213.48314606771)
				{
					Lib.application.window.width = 480;
					Lib.application.window.height = Std.int((Conductor.songPosition - 124044.94382022502) / 168.539325843 * 640);
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 320);
					camHUD.x = 320;
				}
				else if (Conductor.songPosition < 134494.38202247224)
				{
					Lib.application.window.width = 480;
					Lib.application.window.height = 640 + Std.int((Conductor.songPosition - 124213.48314606771) / 10280.8988764 * 80);
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3 - 240);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 320);
					camHUD.x = 320;
				}
				else if (Conductor.songPosition < 134662.92134831494)
				{
					Lib.application.window.width = 480;
					Lib.application.window.height = 720 - Std.int((Conductor.songPosition - 134494.38202247224) / 168.539325843 * 719);
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.3
						+ (Conductor.songPosition - 134494.38202247224) / 168.539325843 * (PlayWindow.stage[0] * 0.4))
						- 240;
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 320);
					camHUD.x = 320;
				}
				else if (Conductor.songPosition < 134831.46067415763)
				{
					Lib.application.window.width = 480;
					Lib.application.window.height = 1;
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7) - 240;
					Lib.application.window.x = Std.int(PlayWindow.stage[1] / 2 - 320);
					camHUD.x = 320;
				}
				else if (Conductor.songPosition < 135000.00000000032)
				{
					Lib.application.window.width = 480;
					Lib.application.window.height = Std.int((Conductor.songPosition - 134831.46067415763) / 168.539325843 * 640);
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7) - 240;
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 320);
					camHUD.x = -260;
				}
				else if (Conductor.songPosition < 145280.89887640477)
				{
					Lib.application.window.width = 480;
					Lib.application.window.height = 640 + Std.int((Conductor.songPosition - 135000.00000000032) / 10280.8988764 * 80);
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7) - 240;
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 320);
					camHUD.x = -260;
				}
				else if (Conductor.songPosition < 145449.43820224746)
				{
					Lib.application.window.width = 480 + Std.int((Conductor.songPosition - 145280.89887640477) / 168.539325843 * 160);
					Lib.application.window.height = 720 - Std.int((Conductor.songPosition - 145280.89887640477) / 168.539325843 * 719);
					Lib.application.window.x = Std.int(PlayWindow.stage[0] * 0.7
						- 240
						- (Conductor.songPosition - 145280.89887640477) / 168.539325843 * (PlayWindow.stage[0] * 0.2 + 80));
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 320 + (Conductor.songPosition - 145280.89887640477) / 168.539325843 * 140);
					camHUD.x = -260;
				}
				else if (Conductor.songPosition < 145617.97752809015)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 1;
					Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2) - 320;
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
					camHUD.x = -260;
				}
				else if (Conductor.songPosition < 145786.51685393284)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = Std.int((Conductor.songPosition - 145617.97752809015) / 168.539325843 * 320);
					Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2) - 320;
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
					camHUD.x = 0;
					PlayWindow.camz = 0.45;
					PlayState.defaultCamZoom = 0.425;
				}
				else if (Conductor.songPosition < 156067.4157303373)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 320 + Std.int((Conductor.songPosition - 145786.51685393284) / 10280.8988764 * 40);
					Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2) - 320;
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
					camHUD.x = 0;
					PlayWindow.camz = 0.5;
					PlayState.defaultCamZoom = 0.425;
				}
				else
				{
					if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
					{
						Lib.application.window.width = 640;
						Lib.application.window.height = 360;
					}
					Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 320);
					Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
						- (Conductor.songPosition - 156067.4157303373) / 168.539325843 * PlayWindow.stage[1] / 5)
						- 180;
					camHUD.x = 0;
					PlayWindow.camz = 0.5;
					PlayState.defaultCamZoom = 0.425;
				}
			}
			else if (Conductor.songPosition >= 156404.49438202268 && Conductor.songPosition < 167106.74157303385)
			{
				PlayWindow.camz = 1;
				PlayState.defaultCamZoom = 0.85;
				FlxG.scaleMode = new RatioScaleMode();
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				Lib.application.window.x = Std.int(FlxMath.fastSin((Conductor.songPosition - 156404.49438202268) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[0] * 2 / 10)
					+ PlayWindow.stage[0] / 2
						- 320);
				Lib.application.window.y = Std.int(FlxMath.fastCos((Conductor.songPosition - 156404.49438202268) / (2696.62921348) * 3.1415926535) * (PlayWindow.stage[1] * -2 / 10)
					+ PlayWindow.stage[1] / 2
						- 180);
			}
			else if (Conductor.songPosition >= 167191.0112359552 && Conductor.songPosition < 172584.26966292146)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				switch (Std.int((Conductor.songPosition - 167191.0112359552) / 337.078651685) % 4)
				{
					case 0:
						if (Conductor.songPosition % 40 < 20)
						{
							Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 480);
							Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 360);
						}
						else
						{
							Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 160);
							Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2);
						}
					break;
case 1:
						if (Conductor.songPosition % 40 < 20)
						{
							Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2
								- 480
								+ 320 * ((Conductor.songPosition - 167191.0112359552) % 337.078651685) / 337.078651685);
							Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 360);
						}
						else
						{
							Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2
								- 160
								- 320 * ((Conductor.songPosition - 167191.0112359552) % 337.078651685) / 337.078651685);
							Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2);
						}
					break;
case 2:
						if (Conductor.songPosition % 40 < 20)
						{
							Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 160);
							Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 360);
						}
						else
						{
							Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 480);
							Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2);
						}
					break;
case 3:
						if (Conductor.songPosition % 40 < 20)
						{
							Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 160);
							Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
								- 360
								+ 360 * ((Conductor.songPosition - 167191.0112359552) % 337.078651685) / 337.078651685);
						}
						else
						{
							Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 480);
							Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
								- 360 * ((Conductor.songPosition - 167191.0112359552) % 337.078651685) / 337.078651685);
						}
				break;
}
			}
			else if (Conductor.songPosition >= 172584.26966292146 && Conductor.songPosition < 177977.52808988772)
			{
				if (Lib.application.window.width != 640 || Lib.application.window.height != 360)
				{
					Lib.application.window.width = 640;
					Lib.application.window.height = 360;
				}
				if (Conductor.songPosition % 1348.31460674 < 674.15730337)
				{
					if (Conductor.songPosition % 40 < 20)
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2
							+ 320 * FlxMath.fastSin((Conductor.songPosition % 674.15730337) / 674.15730337 * 3.1415926535)
							- 320);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
					}
					else
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2
							- 320 * FlxMath.fastSin((Conductor.songPosition % 674.15730337) / 674.15730337 * 3.1415926535)
							- 320);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2 - 180);
					}
				}
				else
				{
					if (Conductor.songPosition % 40 < 20)
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 320);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
							+ 180 * FlxMath.fastSin((Conductor.songPosition % 674.15730337) / 674.15730337 * 3.1415926535)
							- 180);
					}
					else
					{
						Lib.application.window.x = Std.int(PlayWindow.stage[0] / 2 - 320);
						Lib.application.window.y = Std.int(PlayWindow.stage[1] / 2
							- 180 * FlxMath.fastSin((Conductor.songPosition % 674.15730337) / 674.15730337 * 3.1415926535)
							- 180);
					}
				}
			}
		}
	}
return {nreset,pos,spos,show,kill,move};};