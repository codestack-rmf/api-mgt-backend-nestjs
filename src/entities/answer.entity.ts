import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Answer {
    @PrimaryGeneratedColumn('increment', { name: 'id', comment: 'Answer Id' })
    id: number;

    @OneToOne(() => User, (user) => user.answer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' }) // Clave foránea en Answer
    user: User;

    @Column({name: 'build_philosophy', type: "smallint", nullable : false, comment: 'Deck Name'})
    buildPhilosophy: number;

    @Column({name: 'commander_staples', type: "smallint", nullable : false, comment: 'Deck Name'})
    commanderStaples: number;

    @Column({name: 'consistency', type: "smallint", nullable : false, comment: 'Deck Name'})
    consistency: number;

    @Column({name: 'manabase', type: "smallint", nullable : false, comment: 'Deck Name'})
    manabase: number;

    @Column({name: 'player_goal', type: "smallint", nullable : false, comment: 'Deck Name'})
    playerGoal: number;

    @Column({name: 'speed', type: "smallint", nullable : false, comment: 'Deck Name'})
    speed: number;

    @Column({name: 'strategy', type: "smallint", nullable : false, comment: 'Deck Name'})
    strategy: number;

    @Column({name: 'the_list', type: "smallint", nullable : false, comment: 'Deck Name'})
    theList: number;

    @Column({name: 'win_archetype', type: "smallint", nullable : false, comment: 'Deck Name'})
    winArchetype: number;

    @Column({name: 'win_condition', type: "smallint", nullable : false, comment: 'Deck Name'})
    winCondition: number;

    @Column({ type: 'smallint', name: 'active', nullable: false, default: 1, comment: 'Active Id' })
    active: number;

}
