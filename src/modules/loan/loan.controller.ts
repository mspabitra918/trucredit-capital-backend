import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { LoanService } from "./loan.service";
import { CreateLoanDto } from "./dto/create-loan.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("loans")
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  // Public endpoint — anyone can apply (guest or logged in)
  @Post("apply")
  async apply(@Body() dto: CreateLoanDto, @Req() req: any) {
    const userId = req.user?.id;
    const application = await this.loanService.create(dto, userId);
    return {
      message: "Loan application submitted successfully",
      data: {
        id: application.id,
        status: application.status,
        tier: application.tier,
      },
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // async myApplications(@CurrentUser('id') userId: string) {
  //   const data = await this.loanService.findMine(userId);
  //   return { message: 'My applications', data };
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get(":id")
  // async findOne(@Param("id", ParseUUIDPipe) id: string) {
  //   const data = await this.loanService.findOne(id);
  //   return { message: "Application detail", data };
  // }
}
