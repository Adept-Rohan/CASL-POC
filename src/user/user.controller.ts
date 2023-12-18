import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  AbilityFactory,
  Action,
} from 'src/ability/ability.factory/ability.factory';
import { User } from './entities/user.entity';
import { ForbiddenError } from '@casl/ability';
import {
  CheckAbilities,
  ReadUserAbility,
} from 'src/ability/ability.factory/ability.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private abilityFactory: AbilityFactory,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    const user = { id: 1, isAdmin: false, orgId: 1 };
    const ability = this.abilityFactory.defineAbility(user);

    // const isAllowed = ability.can(Action.Create, User);
    //   if (!isAllowed) {
    //     throw new ForbiddenException('Only Admin ');
    //   }
    //   return this.userService.create(createUserDto);
    //
    try {
      ForbiddenError.from(ability)
        .setMessage('Admin Only')
        .throwUnlessCan(Action.Create, User);
      return this.userService.create(createUserDto);
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message);
    }
  }

  @Get()
  // @UseGuards(AbilitiesGuard) Has been globally configured
  @CheckAbilities(new ReadUserAbility())
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  // @UseGuards(AbilitiesGuard)
  @CheckAbilities(new ReadUserAbility())
  findOne(@Param('id') id: number) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const user = { id: 1, isAdmin: false, orgId: 1 };
    const ability = this.abilityFactory.defineAbility(user);
    try {
      const userToUpdate = this.userService.findOne(+id);
      ForbiddenError.from(ability)
        .setMessage('Admin Only')
        .throwUnlessCan(Action.Update, userToUpdate);
      return this.userService.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message);
    }
  }

  @Delete(':id')
  // @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Delete, subject: User })
  remove(@Param('id') id: number) {
    return this.userService.remove(+id);
  }
}
